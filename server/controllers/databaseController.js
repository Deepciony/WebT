import database from "../database.js";

const tables = ["products", "brands", "members", "pdTypes", "carts"];

// tables whose rows an admin may delete straight from the overview,
// with the column that identifies a row. members and carts keep their own
// handlers below because a member may also delete their own data.
const deletableTables = {
    products: "pdId",
    brands: "brandId",
    pdTypes: "pdTypeId"
};

export async function deleteRow(req, res) {
    const table = String(req.params.table || "");
    const id = typeof req.params.id === "string" ? req.params.id.trim() : "";
    const key = Object.prototype.hasOwnProperty.call(deletableTables, table) ? deletableTables[table] : null;
    if (!key) {
        return res.status(400).json({ error: 'db.tableNotDeletable' });
    }
    if (!id) {
        return res.status(400).json({ error: 'db.rowIdRequired' });
    }
    if (req.member?.dutyId !== 'admin') {
        return res.status(403).json({ error: 'db.deleteRowNotAllowed' });
    }
    try {
        // table and key come from the whitelist above, never from the request
        const result = await database.query({
            text: `DELETE FROM "${table}" WHERE "${key}" = $1 RETURNING "${key}"`,
            values: [id]
        });
        if (!result.rowCount) {
            return res.status(404).json({ error: 'db.rowNotFound' });
        }
        return res.status(200).json({ deleted: result.rows[0][key] });
    } catch (err) {
        if (err.code === '23503') return res.status(409).json({ error: 'db.rowInUse' });
        console.error(err);
        return res.status(500).json({ error: 'db.deleteRowFail' });
    }
}


export async function deleteMember(req, res) {
    // requireLogin already verified the token cookie and filled req.member
    const memEmail = typeof req.params.memEmail === 'string' ? req.params.memEmail.trim() : '';
    if (!memEmail) {
        return res.status(400).json({ error: 'db.memberEmailRequired' });
    }

    // Without this any signed-in member could delete anyone else
    const isAdmin = req.member?.dutyId === 'admin';
    if (!isAdmin && req.member?.memEmail !== memEmail) {
        return res.status(403).json({ error: 'db.deleteMemberNotAllowed' });
    }

    try {
        const result = await database.query({
            text: `DELETE FROM "members" WHERE "memEmail" = $1 RETURNING "memEmail";`,
            values: [memEmail]
        });
        if (!result.rowCount) {
            return res.status(404).json({ error: 'db.memberNotFound' });
        }
        return res.status(200).json({ deleted: result.rows[0].memEmail });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'db.deleteMemberFail' });
    }
}

export async function deleteCartHistory(req, res) {
    const cartId = typeof req.params.cartId === 'string' ? req.params.cartId.trim() : '';
    if (!cartId) {
        return res.status(400).json({ error: 'db.cartIdRequired' });
    }

    const isAdmin = req.member?.dutyId === 'admin';
    try {
        const cartResult = await database.query({
            text: `SELECT "cusId" FROM carts WHERE "cartId" = $1;`,
            values: [cartId]
        });

        if (!cartResult.rowCount) {
            return res.status(404).json({ error: 'db.cartNotFound' });
        }

        if (!isAdmin && cartResult.rows[0].cusId !== req.member?.memEmail) {
            return res.status(403).json({ error: 'db.deleteCartNotAllowed' });
        }

        await database.query({
            text: `DELETE FROM "cartDtl" WHERE "cartId" = $1;`,
            values: [cartId]
        });

        const result = await database.query({
            text: `DELETE FROM carts WHERE "cartId" = $1 RETURNING "cartId";`,
            values: [cartId]
        });

        if (!result.rowCount) {
            return res.status(404).json({ error: 'db.cartNotFound' });
        }

        return res.status(200).json({ deleted: result.rows[0].cartId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'db.deleteCartFail' });
    }
}

export async function getDatabaseOverview(req, res) {
    try {
        const result = await database.query({
            text: `SELECT table_name
                   FROM information_schema.tables
                   WHERE table_schema = 'public'
                     AND table_name = ANY($1::text[])
                   ORDER BY table_name;`,
            values: [tables]
        });

        const availableTables = result.rows.map((row) => row.table_name);
        const overview = await Promise.all(availableTables.map(async (tableName) => {
            const columnsResult = await database.query({
                text: `SELECT column_name, data_type
                       FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = $1
                       ORDER BY ordinal_position;`,
                values: [tableName]
            });

            const dataQuery = tableName === 'members'
                ? `SELECT "memEmail", "memName", "dutyId",
                         CASE WHEN "memHash" IS NOT NULL
                             THEN 'ตั้งรหัสผ่านแล้ว'
                             ELSE 'ยังไม่ได้ตั้งรหัสผ่าน'
                         END AS "passwordStatus"
                    FROM "members" ORDER BY "memEmail";`
                : `SELECT * FROM "${tableName}" LIMIT 100;`;
            const dataResult = await database.query(dataQuery);

            return {
                name: tableName,
                count: dataResult.rowCount,
                columns: columnsResult.rows,
                rows: dataResult.rows
            };
        }));

        res.status(200).json({ tables: overview });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูลฐานข้อมูลได้' });
    }
}
