import database from "../database.js";

const tables = ["products", "brands", "pdTypes", "users"];

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

            const dataQuery = tableName === 'users'
                 ? `SELECT "userId", "username", "email",
                         CASE WHEN "passwordHash" IS NOT NULL
                             THEN 'ตั้งรหัสผ่านแล้ว'
                             ELSE 'ยังไม่ได้ตั้งรหัสผ่าน'
                         END AS "passwordStatus",
                         "createdAt"
                    FROM "users" ORDER BY "userId";`
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
