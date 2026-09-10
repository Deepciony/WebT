import database from "../database.js";

export async function getAllProduct(req, res) {
    console.log(`GET /products request received`)
    try {
        const result = await database.query(`
            SELECT p.*,
            (
                SELECT row_to_json(brand_obj)
                FROM (
                    SELECT "brandId", "brandName"
                    FROM brands
                    WHERE "brandId" = p."brandId"
                ) brand_obj
            ) AS brand,
            (
                SELECT row_to_json(pdt_obj)
                FROM (
                    SELECT "pdTypeId", "pdTypeName"
                    FROM "pdTypes"
                    WHERE "pdTypeId" = p."pdTypeId"
                ) pdt_obj
            ) AS pdt
            FROM products p
            ORDER BY p."pdId";
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getProductById(req, res) {
    console.log(`GET /products/${req.params.id} request received`)
    try {
        const result = await database.query({
            text: `SELECT p.*,
            (
                SELECT row_to_json(brand_obj)
                FROM (
                    SELECT "brandId", "brandName"
                    FROM brands
                    WHERE "brandId" = p."brandId"
                ) brand_obj
            ) AS brand,
            (
                SELECT row_to_json(pdt_obj)
                FROM (
                    SELECT "pdTypeId", "pdTypeName"
                    FROM "pdTypes"
                    WHERE "pdTypeId" = p."pdTypeId"
                ) pdt_obj
            ) AS pdt
            FROM products p
            WHERE p."pdId" = $1;`,
            values: [req.params.id]
        });
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function createProduct(req, res) {
    const { pdName, pdPrice, pdRemark, brandId, brandName, pdTypeId } = req.body;

    if (!pdName || pdPrice === undefined || !brandId || !brandName || !pdTypeId) {
        return res.status(400).json({ error: 'pdName, pdPrice, brandId, brandName and pdTypeId are required' });
    }

    try {
        await database.query({
            text: `INSERT INTO brands ("brandId", "brandName") VALUES ($1, $2)
                   ON CONFLICT ("brandId") DO UPDATE SET "brandName" = EXCLUDED."brandName";`,
            values: [brandId.trim(), brandName.trim()]
        });
        const result = await database.query({
            text: `INSERT INTO products ("pdName", "pdPrice", "pdRemark", "brandId", "pdTypeId")
                   VALUES ($1, $2, $3, $4, $5)
                   RETURNING *;`,
            values: [pdName, pdPrice, pdRemark || '', brandId, pdTypeId]
        });
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateProduct(req, res) {
    const { pdName, pdPrice, pdRemark, brandId, brandName, pdTypeId } = req.body;
    const productId = req.params.id;
    const normalizedProductId = productId.replace(/^0+/, '') || '0';

    if (!pdName || pdPrice === undefined || !brandId || !brandName || !pdTypeId) {
        return res.status(400).json({ error: 'pdName, pdPrice, brandId, brandName and pdTypeId are required' });
    }

    try {
        await database.query({
            text: `INSERT INTO brands ("brandId", "brandName") VALUES ($1, $2)
                   ON CONFLICT ("brandId") DO UPDATE SET "brandName" = EXCLUDED."brandName";`,
            values: [brandId.trim(), brandName.trim()]
        });
        const result = await database.query({
            text: `UPDATE products
                   SET "pdName" = $1,
                       "pdPrice" = $2,
                       "pdRemark" = $3,
                       "brandId" = $4,
                       "pdTypeId" = $5
                     WHERE "pdId"::text = $6 OR "pdId"::text = $7
                   RETURNING *;`,
                 values: [pdName, pdPrice, pdRemark || '', brandId, pdTypeId, productId, normalizedProductId]
        });

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getThreeProduct(req, res) {
    console.log(`GET /ThreeProduct request received`)
    try {
        const strQry = `SELECT p.*,
                        (   
                            SELECT row_to_json(brand_obj)
                            FROM ( SELECT "brandId", "brandName"
                            FROM brands
                            WHERE "brandId"=p."brandId") brand_obj
                        ) AS brand,
                        (
                            SELECT row_to_json(pdt_obj)
                            FROM ( SELECT "pdTypeId","pdTypeName"
                                     FROM "pdTypes"
                                     WHERE "pdTypeId"=p."pdTypeId") pdt_obj
    ) AS pdt
     FROM products p ORDER BY "pdId"
     OFFSET 0 LIMIT 3;`
        const result = await database.query(strQry);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getSearchProduct(req, res) {
    console.log(`GET / searchProduct id=${req.params.id} request received`)
    try {
        const result = await database.query({
            text: `SELECT p.*,
            (   
                SELECT row_to_json(brand_obj)
                FROM ( SELECT "brandId", "brandName"
                FROM brands
                WHERE "brandId"=p."brandId") brand_obj
            ) AS brand,
            (
                SELECT row_to_json(pdt_obj)
                FROM ( SELECT "pdTypeId","pdTypeName"
                         FROM "pdTypes"
                         WHERE "pdTypeId"=p."pdTypeId") pdt_obj
        ) AS pdt
         FROM products p
         WHERE (
                p."pdId"::text ILIKE $1
                OR p."pdName" ILIKE $1
                OR p."pdRemark" ILIKE $1
              OR p."pdPrice"::text ILIKE $1
                OR p."brandId" ILIKE $1
                OR p."pdTypeId" ILIKE $1
              OR EXISTS (
                  SELECT 1
                  FROM brands b
                  WHERE b."brandId" = p."brandId"
                 AND b."brandName" ILIKE $1
              )
         );`,
            values: [`%${req.params.id}%`]
        });
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
