import database from "../database.js";
import fs from "fs/promises";
import path from "path";
import multer from "multer";

const imageDirectory = path.resolve('img_pd');
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
    }
});

const imageStem = (productId) => {
    const numericId = Number(productId);
    return Number.isNaN(numericId) ? String(productId) : String(numericId - 3).padStart(3, '0');
};

export const uploadProductImage = imageUpload.single('image');

export async function getProductImage(req, res) {
    try {
        const stem = imageStem(req.params.id);
        const files = await fs.readdir(imageDirectory);
        const filename = files.find((file) => path.parse(file).name === stem);
        if (!filename) return res.status(404).send('Image not found');
        return res.sendFile(path.join(imageDirectory, filename));
    } catch (err) {
        console.error(err);
        return res.status(404).send('Image not found');
    }
}

export async function uploadProductImageFile(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'manage.imageInvalid' });
    }

    try {
        const stem = imageStem(req.params.id);
        await fs.mkdir(imageDirectory, { recursive: true });
        const files = await fs.readdir(imageDirectory);
        await Promise.all(files
            .filter((file) => path.parse(file).name === stem)
            .map((file) => fs.unlink(path.join(imageDirectory, file))));

        const extension = req.file.mimetype === 'image/png'
            ? '.png'
            : req.file.mimetype === 'image/webp' ? '.webp' : '.jpg';
        await fs.writeFile(path.join(imageDirectory, `${stem}${extension}`), req.file.buffer);
        return res.status(200).json({ imageUrl: `/products/${req.params.id}/image` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'manage.imageUploadFail' });
    }
}

export async function getAllProduct(req, res) {
    console.log(`GET /products request received`)
    try {
        const result = await database.query(`
            SELECT p.*, '/products/' || p."pdId" || '/image' AS logosrc,
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
            text: `SELECT p.*, '/products/' || p."pdId" || '/image' AS logosrc,
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
        const nextIdResult = await database.query(`
            SELECT LPAD((COALESCE(MAX(CASE WHEN "pdId" ~ '^[0-9]+$'
                                            THEN "pdId"::integer END), 0) + 1)::text, 3, '0') AS "pdId"
            FROM products;
        `);
        const nextProductId = nextIdResult.rows[0].pdId;
        const result = await database.query({
            text: `INSERT INTO products ("pdId", "pdName", "pdPrice", "pdRemark", "brandId", "pdTypeId")
                   VALUES ($1, $2, $3, $4, $5, $6)
                   RETURNING *;`,
            values: [nextProductId, pdName, pdPrice, pdRemark || '', brandId, pdTypeId]
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
        const strQry = `SELECT p.*, '/products/' || p."pdId" || '/image' AS logosrc,
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
        const keyword = String(req.params.id).replace(/\s+/g, '');
        const result = await database.query({
            text: `SELECT p.*, '/products/' || p."pdId" || '/image' AS logosrc,
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
                                regexp_replace(p."pdId"::text, '\\s+', '', 'g') ILIKE $1
                                OR regexp_replace(p."pdName", '\\s+', '', 'g') ILIKE $1
                                OR regexp_replace(p."pdRemark", '\\s+', '', 'g') ILIKE $1
                                OR regexp_replace(p."pdPrice"::text, '\\s+', '', 'g') ILIKE $1
                                OR regexp_replace(p."brandId", '\\s+', '', 'g') ILIKE $1
                                OR regexp_replace(p."pdTypeId", '\\s+', '', 'g') ILIKE $1
              OR EXISTS (
                  SELECT 1
                  FROM brands b
                  WHERE b."brandId" = p."brandId"
                                 AND regexp_replace(b."brandName", '\\s+', '', 'g') ILIKE $1
              )
         );`,
                        values: [`%${keyword}%`]
        });
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
