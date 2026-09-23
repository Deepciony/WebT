import jwt from "jsonwebtoken";
import database from "../database.js";

// The cart belongs to the signed-in member, so the owner comes from the token
// cookie, never from the request body — a body value could name anyone.
function readMember(req) {
    const token = req.cookies?.token;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
        console.log(err.message);
        return null;
    }
}

async function ownsCart(memEmail, cartId) {
    const result = await database.query({
        text: `SELECT "cusId" FROM carts WHERE "cartId" = $1`,
        values: [cartId]
    });
    return result.rows[0]?.cusId === memEmail;
}

// A confirmed cart is an order already placed: it must not change any more
async function canEditCart(memEmail, cartId) {
    const result = await database.query({
        text: `SELECT "cusId", "cartCf" FROM carts WHERE "cartId" = $1`,
        values: [cartId]
    });
    const cart = result.rows[0];
    return Boolean(cart) && cart.cusId === memEmail && cart.cartCf !== true;
}

export async function chkCart(req, res) {
    const member = readMember(req);
    console.log(`POST CART customer ${member?.memEmail} is requested`);
    if (!member) {
        return res.json({ cartExist: false, error: true, errormessage: "Login is required" });
    }
    try {
        // An open cart is one that has not been confirmed yet
        const result = await database.query({
            text: `SELECT * FROM carts WHERE "cusId" = $1 AND "cartCf" != true`,
            values: [member.memEmail]
        });
        if (result.rows[0] != null) {
            return res.json({ cartExist: true, cartId: result.rows[0].cartId });
        }
        return res.json({ cartExist: false });
    } catch (err) {
        return res.json({ cartExist: false, error: true, errormessage: err.message || `Server error` });
    }
}

export async function postCart(req, res) {
    const member = readMember(req);
    console.log(`POST /CART is requested`);
    if (!member) {
        return res.json({ cartOK: false, messageAddCart: "Login is required" });
    }
    try {
        // One open cart per member: a double click must not create a second one
        const open = await database.query({
            text: `SELECT "cartId" FROM carts WHERE "cusId" = $1 AND "cartCf" != true`,
            values: [member.memEmail]
        });
        if (open.rows[0]) {
            return res.json({ cartOK: true, messageAddCart: open.rows[0].cartId });
        }

        // Cart id is YYYYMMDD + a running number for that day
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const currentDate = `${year}${month}${day}`;

        let i = 0;
        let theId = "";
        let existsResult = [];
        do {
            i++;
            theId = `${currentDate}${String(i).padStart(4, "0")}`;
            existsResult = await database.query({
                text: `SELECT EXISTS (SELECT * FROM carts WHERE "cartId" = $1)`,
                values: [theId]
            });
        } while (existsResult.rows[0].exists);

        await database.query({
            text: `INSERT INTO carts ("cartId", "cusId", "cartDate") VALUES ($1, $2, $3)`,
            values: [theId, member.memEmail, now]
        });
        return res.json({ cartOK: true, messageAddCart: theId });
    } catch (err) {
        return res.json({ cartOK: false, messageAddCart: err.message || `Server error` });
    }
}

export async function postCartDtl(req, res) {
    const member = readMember(req);
    console.log(`POST /CARTDETAIL is requested`);
    if (!member) {
        return res.json({ cartDtlOK: false, messageAddCartDtl: "Login is required" });
    }
    try {
        if (req.body.cartId == null || req.body.pdId == null) {
            return res.json({
                cartDtlOK: false,
                messageAddCartDtl: "CartId && ProductID is required"
            });
        }
        if (!await canEditCart(member.memEmail, req.body.cartId)) {
            return res.json({ cartDtlOK: false, messageAddCartDtl: "This cart cannot be changed" });
        }

        // The price comes from the products table, never from the request:
        // a body value would let the buyer pick their own price.
        const priceResult = await database.query({
            text: `SELECT "pdPrice" FROM products WHERE "pdId" = $1`,
            values: [req.body.pdId]
        });
        if (priceResult.rowCount === 0) {
            return res.json({ cartDtlOK: false, messageAddCartDtl: "Product not found" });
        }
        const price = priceResult.rows[0].pdPrice;

        // Same product already in the cart? add to its quantity instead of a second row
        const pdResult = await database.query({
            text: `SELECT * FROM "cartDtl" ctd WHERE ctd."cartId" = $1 AND ctd."pdId" = $2`,
            values: [req.body.cartId, req.body.pdId]
        });
        const qty = Math.max(1, Math.floor(Number(req.body.qty)) || 1);

        if (pdResult.rowCount == 0) {
            await database.query({
                text: `INSERT INTO "cartDtl" ("cartId", "pdId", "qty", "price") VALUES ($1, $2, $3, $4)`,
                values: [req.body.cartId, req.body.pdId, qty, price]
            });
        } else {
            await database.query({
                text: `UPDATE "cartDtl" SET "qty" = $1 WHERE "cartId" = $2 AND "pdId" = $3`,
                values: [pdResult.rows[0].qty + qty, req.body.cartId, req.body.pdId]
            });
        }
        return res.json({ cartDtlOK: true, messageAddCartDtl: req.body.cartId });
    } catch (err) {
        return res.json({ cartDtlOK: false, messageAddCartDtl: err.message || `Server error` });
    }
}

export async function setCartDtlQty(req, res) {
    const member = readMember(req);
    console.log(`PUT /CARTDETAIL is requested`);
    if (!member) {
        return res.json({ cartDtlOK: false, messageAddCartDtl: "Login is required" });
    }
    try {
        const qty = Math.floor(Number(req.body.qty))
        if (req.body.cartId == null || req.body.pdId == null || !(qty > 0)) {
            return res.json({ cartDtlOK: false, messageAddCartDtl: "CartId && ProductID && Qty is required" });
        }
        if (!await canEditCart(member.memEmail, req.body.cartId)) {
            return res.json({ cartDtlOK: false, messageAddCartDtl: "This cart cannot be changed" });
        }
        await database.query({
            text: `UPDATE "cartDtl" SET "qty" = $1 WHERE "cartId" = $2 AND "pdId" = $3`,
            values: [qty, req.body.cartId, req.body.pdId]
        });
        return res.json({ cartDtlOK: true, messageAddCartDtl: req.body.cartId });
    } catch (err) {
        return res.json({ cartDtlOK: false, messageAddCartDtl: err.message || `Server error` });
    }
}

export async function delCartDtl(req, res) {
    const member = readMember(req);
    console.log(`DELETE /CARTDETAIL ${req.params.id}/${req.params.pdId} is requested`);
    if (!member) {
        return res.json({ delOK: false, message: "Login is required" });
    }
    try {
        if (!await canEditCart(member.memEmail, req.params.id)) {
            return res.json({ delOK: false, message: "This cart cannot be changed" });
        }
        await database.query({
            text: `DELETE FROM "cartDtl" WHERE "cartId" = $1 AND "pdId" = $2`,
            values: [req.params.id, req.params.pdId]
        });
        return res.json({ delOK: true, message: `Delete detail success` });
    } catch (err) {
        return res.json({ delOK: false, message: err.message || `Server error` });
    }
}

export async function delCart(req, res) {
    const member = readMember(req);
    console.log(`DELETE /CART ${req.params.id} is requested`);
    if (!member) {
        return res.json({ delOK: false, message: "Login is required" });
    }
    try {
        if (!await canEditCart(member.memEmail, req.params.id)) {
            return res.json({ delOK: false, message: "This cart cannot be changed" });
        }
        // Details first: they reference the cart
        await database.query({
            text: `DELETE FROM "cartDtl" WHERE "cartId" = $1`,
            values: [req.params.id]
        });
        await database.query({
            text: `DELETE FROM carts WHERE "cartId" = $1`,
            values: [req.params.id]
        });
        return res.json({ delOK: true, message: `Delete cart success` });
    } catch (err) {
        return res.json({ delOK: false, message: err.message || `Server error` });
    }
}

export async function cfCart(req, res) {
    const member = readMember(req);
    console.log(`PUT /CART CONFIRM ${req.params.id} is requested`);
    if (!member) {
        return res.json({ cfOK: false, message: "Login is required" });
    }
    try {
        if (!await canEditCart(member.memEmail, req.params.id)) {
            return res.json({ cfOK: false, message: "This cart cannot be changed" });
        }
        // An empty cart cannot be ordered
        const countResult = await database.query({
            text: `SELECT COUNT(*) AS rows FROM "cartDtl" WHERE "cartId" = $1`,
            values: [req.params.id]
        });
        if (Number(countResult.rows[0].rows) === 0) {
            return res.json({ cfOK: false, message: `Cart is empty` });
        }
        await database.query({
            text: `UPDATE carts SET "cartCf" = true WHERE "cartId" = $1`,
            values: [req.params.id]
        });
        return res.json({ cfOK: true, message: `Confirm success` });
    } catch (err) {
        return res.json({ cfOK: false, message: err.message || `Server error` });
    }
}

export async function sumCart(req, res) {
    console.log(`GET SumCart ${req.params.id} is requested`);
    const member = readMember(req);
    if (!member) return res.json({ id: req.params.id, qty: 0, money: 0 });
    try {
        if (!await ownsCart(member.memEmail, req.params.id)) {
            return res.json({ id: req.params.id, qty: 0, money: 0 });
        }
        const result = await database.query({
            text: `SELECT SUM(qty) AS qty, SUM(qty * price) AS money
                   FROM "cartDtl" ctd WHERE ctd."cartId" = $1`,
            values: [req.params.id]
        });
        return res.json({
            id: req.params.id,
            qty: result.rows[0].qty,
            money: result.rows[0].money
        });
    } catch (err) {
        return res.json({ error: err.message || `Server error` });
    }
}

export async function getCart(req, res) {
    console.log(`GET Cart ${req.params.id} is requested`);
    const member = readMember(req);
    if (!member) return res.json([]);
    try {
        const result = await database.query({
            text: `SELECT ct.*, SUM(ctd.qty) AS sqty, SUM(ctd.price * ctd.qty) AS sprice
                   FROM carts ct LEFT JOIN "cartDtl" ctd ON ct."cartId" = ctd."cartId"
                   WHERE ct."cartId" = $1 AND ct."cusId" = $2
                   GROUP BY ct."cartId"`,
            values: [req.params.id, member.memEmail]
        });
        return res.json(result.rows);
    } catch (err) {
        return res.json({ error: err.message || `Server error` });
    }
}

export async function getCartDtl(req, res) {
    console.log(`GET CartDtl ${req.params.id} is requested`);
    const member = readMember(req);
    if (!member) return res.json([]);
    try {
        if (!await ownsCart(member.memEmail, req.params.id)) return res.json([]);
        const result = await database.query({
            text: `SELECT ROW_NUMBER() OVER (ORDER BY ctd."pdId") AS row_number,
                          ctd."pdId", pd."pdName", ctd.qty, ctd.price
                   FROM "cartDtl" ctd LEFT JOIN "products" pd ON ctd."pdId" = pd."pdId"
                   WHERE ctd."cartId" = $1
                   ORDER BY ctd."pdId"`,
            values: [req.params.id]
        });
        return res.json(result.rows);
    } catch (err) {
        return res.json({ error: err.message || `Server error` });
    }
}

export async function getCartByCus(req, res) {
    console.log(`POST Cart By Customer is requested`);
    const member = readMember(req);
    if (!member) return res.json([]);
    try {
        const result = await database.query({
            text: `SELECT ROW_NUMBER() OVER (ORDER BY ct."cartId" DESC) AS row_number,
                          ct.*, SUM(ctd.qty) AS sqty, SUM(ctd.price * ctd.qty) AS sprice
                   FROM carts ct LEFT JOIN "cartDtl" ctd ON ct."cartId" = ctd."cartId"
                   WHERE ct."cusId" = $1
                   GROUP BY ct."cartId"
                   ORDER BY ct."cartId" DESC`,
            values: [member.memEmail]
        });
        return res.json(result.rows);
    } catch (err) {
        return res.json({ error: err.message || `Server error` });
    }
}
