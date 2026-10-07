// Builds docs/Lab09-11-Guide.pdf from the project's real source files.
//
//   npm i -D playwright-core      (once, if it is not installed)
//   node docs/build-guide.mjs
//
// It renders an HTML page with Chrome and prints it to PDF, so the guide always
// quotes the code that is actually in the repo.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright-core'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'docs')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n').trimEnd()
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const noStyle = (s) => s.replace(/\n*<style[\s\S]*?<\/style>/g, '').trimEnd()
const scriptOnly = (s) => (s.match(/<script setup>[\s\S]*?<\/script>/) || [''])[0]
const constFn = (src, name) => {
    const start = src.indexOf(`const ${name} = `)
    if (start < 0) return ''
    const end = src.indexOf('\n}', start)
    return src.slice(start, end + 2)
}

const fn = (src, name) => {
    const start = src.indexOf(`export async function ${name}`)
    if (start < 0) return ''
    const end = src.indexOf('\n}', start)
    return src.slice(start, end + 2)
}

const code = (label, text, lang = '') => `
<figure class="code">
  <figcaption><span>${esc(label)}</span>${lang ? `<em>${lang}</em>` : ''}</figcaption>
  <pre><code>${esc(text)}</code></pre>
</figure>`

const note = (kind, title, body) => `<aside class="note ${kind}"><strong>${title}</strong><div>${body}</div></aside>`

const pkg = JSON.parse(read('package.json'))
const memberController = read('server/controllers/memberController.js')
const cartController = read('server/controllers/cartController.js')
const serverIndex = read('server/index.js')
const pageMember = read('src/pages/PageMember.vue')
const nginxConf = read('docs/nginx.conf.example')
const swaggerYaml = read('server/swagger.yaml')
const swaggerYamlPart = (from, to) => swaggerYaml.slice(swaggerYaml.indexOf(from), to ? swaggerYaml.indexOf(to) : undefined).trimEnd()
const mainMenu = read('src/components/layout/MainMenu.vue')
const menuScript = scriptOnly(mainMenu)
const menuItems = (mainMenu.match(/ *<li v-if="!?authStore\.isLogin" class="nav-item">[\s\S]*?<\/li>/g) || [])
    .filter((li) => /pagemember|memLogout|\/login|CartInfo/.test(li))
    .map((li) => li.replace(/^ {10}/gm, ''))
    .join('\n')

const html = `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>คู่มือ Lab 09–11 KUSHOP</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Playfair+Display:wght@600;700&family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #0f172a; --muted: #475569; --line: #e2e8f0; --soft: #f1f5f9;
    --sky: #1d4ed8; --sky-soft: #dbeafe; --leaf: #15803d; --leaf-soft: #dcfce7;
    --warn: #92400e; --warn-soft: #fef3c7; --coral: #b42c2c; --coral-soft: #fee2e2;
  }
  @page { size: A4; margin: 18mm 16mm 20mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: var(--ink); font: 10.5pt/1.65 'Sarabun', 'IBM Plex Sans Thai', sans-serif; }
  h1, h2, h3 { font-family: 'Playfair Display', 'Sarabun', serif; line-height: 1.25; break-after: avoid; }
  h2 { margin: 0 0 10pt; padding: 10pt 0 6pt; font-size: 19pt; border-bottom: 2px solid var(--sky); }
  h2 .no { color: var(--sky); margin-right: 6pt; }
  h3 { margin: 12pt 0 6pt; padding-top: 6pt; font-size: 13pt; }
  h3 small { color: var(--muted); font: 400 9.5pt 'Sarabun', sans-serif; }
  p { margin: 0 0 7pt; }
  ul, ol { margin: 0 0 8pt; padding-left: 18pt; }
  li { margin-bottom: 3pt; }
  code, pre { font-variant-ligatures: none; font-feature-settings: 'liga' 0, 'calt' 0; }
  code { font-family: 'JetBrains Mono', monospace; font-size: 8.8pt; padding: 1px 4px; background: var(--soft); border-radius: 3px; }
  section { break-before: page; }
  table { width: 100%; margin: 4pt 0 10pt; border-collapse: collapse; font-size: 9.5pt; break-inside: avoid; }
  th, td { padding: 5pt 7pt; border: 1px solid var(--line); text-align: left; vertical-align: top; }
  th { background: var(--soft); font-weight: 600; }
  td code { overflow-wrap: anywhere; }

  .cover { height: 250mm; display: flex; flex-direction: column; justify-content: center; }
  .cover .kicker { color: var(--sky); font-weight: 700; letter-spacing: .12em; font-size: 10pt; }
  .cover h1 { margin: 8pt 0 10pt; font-size: 34pt; }
  .cover .sub { max-width: 140mm; color: var(--muted); font-size: 13pt; }
  .cover .meta { margin-top: 26pt; padding-top: 12pt; border-top: 1px solid var(--line); color: var(--muted); font-size: 10pt; }
  .toc ol { padding-left: 16pt; font-size: 11pt; }
  .toc li { margin-bottom: 5pt; }
  .toc-parts { list-style: none; padding: 0; margin-bottom: 14pt; font-size: 11pt; }
  .toc-parts b { display: inline-block; width: 44pt; color: var(--sky); }
  .toc-label { margin: 0 0 4pt; color: var(--muted); font-weight: 600; }

  figure.code { margin: 6pt 0 12pt; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; }
  figure.code figcaption { display: flex; justify-content: space-between; padding: 4pt 9pt; color: #e2e8f0; background: #1e293b; font: 600 8.5pt 'JetBrains Mono', monospace; break-after: avoid; }
  figure.code figcaption em { color: #94a3b8; font-style: normal; }
  figure.code pre { margin: 0; padding: 8pt 10pt; background: #f8fafc; white-space: pre-wrap; word-break: break-word; font: 8.3pt/1.5 'JetBrains Mono', 'Sarabun', monospace; }
  figure.code pre code { padding: 0; background: none; font-size: inherit; }

  .note { margin: 6pt 0 12pt; padding: 8pt 11pt; border-left: 4px solid var(--sky); border-radius: 4px; background: var(--sky-soft); break-inside: avoid; }
  .note strong { display: block; margin-bottom: 2pt; }
  .note.ok { border-color: var(--leaf); background: var(--leaf-soft); }
  .note.warn { border-color: #d97706; background: var(--warn-soft); }
  .note.danger { border-color: var(--coral); background: var(--coral-soft); }
  .note div > :last-child { margin-bottom: 0; }

  .steps { counter-reset: step; list-style: none; padding: 0; }
  .steps > li { position: relative; margin-bottom: 7pt; padding-left: 26pt; }
  .steps > li::before { counter-increment: step; content: counter(step); position: absolute; left: 0; top: 0; width: 18pt; height: 18pt; color: #fff; background: var(--sky); border-radius: 50%; font: 700 9pt/18pt 'Sarabun'; text-align: center; }

  .flow { display: flex; align-items: stretch; gap: 6pt; margin: 8pt 0 12pt; break-inside: avoid; }
  .flow div { flex: 1; padding: 7pt; border: 1px solid var(--line); border-radius: 6px; background: #fff; font-size: 9pt; }
  .flow div b { display: block; color: var(--sky); }
  .flow span { align-self: center; color: var(--muted); font-weight: 700; }
  table.check { break-inside: auto; }
  table.check tr { break-inside: avoid; }
  .check td:first-child { width: 22pt; text-align: center; }
</style>
</head>
<body>

<div class="cover">
  <div class="kicker">WEB TECHNOLOGY AND WEB SERVICES · 01418441</div>
  <h1>คู่มือทำ Lab 09–13<br>Authentication, JWT, Cart, File Upload &amp; API Document</h1>
  <p class="sub">ขั้นตอนละเอียดสำหรับโปรเจกต์ KUSHOP ตั้งแต่สร้างตารางในฐานข้อมูล เขียน backend และ frontend ระบบสมาชิก การเข้าสู่ระบบด้วย JWT ใน cookie ตะกร้าสินค้าที่เก็บในฐานข้อมูล การอัปโหลดรูปสมาชิก การ deploy ขึ้น NGINX และการทำเอกสาร API ด้วย Swagger</p>
  <div class="meta">
    โค้ดทั้งหมดในเอกสารนี้ดึงมาจากไฟล์จริงในโปรเจกต์ ณ วันที่สร้างเอกสาร<br>
    Node.js ${esc(pkg.engines.node)} · Express · PostgreSQL · Vue 3 · Pinia
  </div>
</div>

<section class="toc">
  <h2>สารบัญ</h2>
  <ul class="toc-parts">
    <li><b>ส่วน A</b> สรุปสิ่งที่ทำไปแล้วใน Lab 09–13</li>
    <li><b>ส่วน B</b> สิ่งที่ต้องทำเอง (ทีละขั้น)</li>
    <li><b>ส่วน C</b> ติดตั้งบนเครื่องใหม่หลัง clone / pull จาก GitHub</li>
    <li><b>ส่วน D</b> ผังโครงสร้างไฟล์ทั้งโปรเจกต์</li>
  </ul>
  <p class="toc-label">รายละเอียดแต่ละเรื่อง</p>
  <ol>
    <li>ภาพรวมระบบ</li>
    <li>สิ่งที่ต้องเตรียม</li>
    <li>ฐานข้อมูล: ตาราง members, carts และ cartDtl</li>
    <li>ตั้งค่าไฟล์ .env</li>
    <li>Backend สมาชิก: memberController, memberRoute, server.js</li>
    <li>ทดสอบ Backend ด้วย Postman</li>
    <li>Frontend: Pinia, authStore, Router</li>
    <li>Frontend: หน้า Login, Register, PageMember และ MainMenu</li>
    <li>Lab 11 Backend: ตะกร้าสินค้า (cartController)</li>
    <li>Lab 11 Frontend: cartStore และหน้าตะกร้า</li>
    <li>รันและทดสอบทั้งระบบ</li>
    <li>ปัญหาที่พบบ่อยและวิธีแก้</li>
    <li>Lab 12: อัปโหลดและแสดงรูปสมาชิก</li>
    <li>Lab 12: Deploy ด้วย NGINX</li>
    <li>Lab 13: เอกสาร API ด้วย Swagger (OpenAPI)</li>
    <li>ส่วนที่ทำเพิ่มนอกแลป (ฟิลเตอร์ ตัวเลือกแบบ custom และการลบข้อมูล)</li>
    <li>สิ่งที่ต่างจากเอกสารแลป</li>
  </ol>
</section>

<section>
  <h2><span class="no">A</span>สิ่งที่ทำไปแล้วใน Lab 09–13</h2>
  <p>ส่วนนี้สรุปว่าในโปรเจกต์มีอะไรทำเสร็จแล้วบ้าง <b>ไม่ต้องเขียนโค้ดเหล่านี้ซ้ำ</b> โค้ดเต็มอยู่ในหัวข้อ 5, 7–10</p>

  <h3>A.1 Lab 09 – Authentication</h3>
  <table>
    <tr><th style="width:62%">หัวข้อในเอกสารแลป</th><th>ทำแล้วที่ไฟล์</th></tr>
    <tr><td><code>postMember</code>: ตรวจข้อมูลครบ, ตรวจอีเมลซ้ำ, hash รหัสผ่านด้วย bcrypt (salt 11), INSERT ลง <code>members</code></td><td><code>controllers/memberController.js</code></td></tr>
    <tr><td><code>loginMember</code>: หาอีเมล แล้วเทียบรหัสด้วย <code>bcrypt.compare</code></td><td><code>controllers/memberController.js</code></td></tr>
    <tr><td>route <code>POST /members</code> และ <code>POST /members/login</code></td><td><code>src/router/memberRoute.js</code></td></tr>
    <tr><td>ฟอร์ม Login (ใช้อีเมลเป็น loginName) และฟอร์ม Register ที่ <code>/register</code></td><td><code>TheLogin.vue</code>, <code>TheRegister.vue</code></td></tr>
  </table>

  <h3>A.2 Lab 10 – Authorization JWT</h3>
  <table>
    <tr><th style="width:62%">หัวข้อในเอกสารแลป</th><th>ทำแล้วที่ไฟล์</th></tr>
    <tr><td>CORS กำหนด origin + <code>credentials: true</code>, เรียก <code>cookieParser()</code> ก่อน router</td><td><code>server.js</code></td></tr>
    <tr><td><code>SECRET_KEY</code> ใน <code>.env</code></td><td><code>.env</code></td></tr>
    <tr><td>login สำเร็จสร้าง JWT อายุ 1 ชม. เก็บใน cookie (<code>httpOnly</code>, <code>secure</code>, <code>sameSite: strict</code>), login ผิดลบ cookie</td><td><code>controllers/memberController.js</code></td></tr>
    <tr><td><code>getMember</code> → <code>GET /members/detail</code>, <code>logoutMember</code> → <code>GET /members/logout</code></td><td><code>memberController.js</code>, <code>memberRoute.js</code></td></tr>
    <tr><td><code>axios.defaults.withCredentials = true</code> และติดตั้ง Pinia</td><td><code>src/main.js</code></td></tr>
    <tr><td>หน้า PageMember, เมนูแสดงชื่อสมาชิก + ปุ่มออกจากระบบ, ถ้า login แล้วเข้า <code>/login</code> ให้เปลี่ยนหน้า</td><td><code>PageMember.vue</code>, <code>MainMenu.vue</code>, <code>src/router/index.js</code></td></tr>
  </table>

  <h3>A.3 Lab 11 – Transaction (ตะกร้าสินค้า)</h3>
  <table>
    <tr><th style="width:38%">หัวข้อในเอกสารแลป</th><th style="width:30%">ฟังก์ชัน / Endpoint</th><th>ไฟล์</th></tr>
    <tr><td>ตรวจตะกร้าค้าง</td><td><code>chkCart</code> · <code>POST /carts/chkcart</code></td><td><code>controllers/cartController.js</code></td></tr>
    <tr><td>สร้างตะกร้า (Gen id)</td><td><code>postCart</code> · <code>POST /carts/addcart</code></td><td><code>controllers/cartController.js</code></td></tr>
    <tr><td>บันทึกสินค้าเข้าตะกร้า</td><td><code>postCartDtl</code> · <code>POST /carts/addcartdtl</code></td><td><code>controllers/cartController.js</code></td></tr>
    <tr><td>นำสินค้าออก / ลบตะกร้า</td><td><code>delCartDtl</code>, <code>delCart</code> · <code>DELETE /carts/...</code></td><td><code>controllers/cartController.js</code></td></tr>
    <tr><td>หายอดรวม</td><td><code>sumCart</code> · <code>GET /carts/sumcart/:id</code></td><td><code>controllers/cartController.js</code></td></tr>
    <tr><td>แสดงหัว/รายละเอียดตะกร้า</td><td><code>getCart</code>, <code>getCartDtl</code></td><td><code>controllers/cartController.js</code></td></tr>
    <tr><td>ตะกร้าทั้งหมดของลูกค้า</td><td><code>getCartByCus</code> · <code>POST /carts/getcartbycus</code></td><td><code>controllers/cartController.js</code></td></tr>
    <tr><td>หน้ารายละเอียดสินค้า + ปุ่มใส่ตะกร้า</td><td>route <code>/productshow/:pdId</code></td><td><code>ProductShow.vue</code></td></tr>
    <tr><td>แสดงตะกร้าบนเมนู</td><td>–</td><td><code>CartInfo.vue</code> ใน <code>MainMenu.vue</code></td></tr>
    <tr><td>หน้ารายละเอียดตะกร้า / ตะกร้าทั้งหมด</td><td>route <code>/cartshow/:cartId</code>, <code>/cartlist</code></td><td><code>CartShow.vue</code>, <code>CartList.vue</code></td></tr>
    <tr><td>Store เก็บจำนวนสินค้าในตะกร้า</td><td><code>useCartStore</code></td><td><code>src/stores/cartStore.js</code></td></tr>
  </table>
  <p>ทำเพิ่มจากแลป: แก้จำนวนสินค้าในตะกร้า (<code>setCartDtlQty</code>) และยืนยันสั่งซื้อ (<code>cfCart</code> → ตั้ง <code>cartCf</code> เป็น true) ซึ่งแลปมีปุ่มไว้แต่ยังไม่ได้เขียนการทำงาน</p>
  <p>ตารางเทียบแบบละเอียดพร้อมเหตุผลอยู่ในหัวข้อ 13</p>
</section>

<section>
  <h2><span class="no">B</span>สิ่งที่ต้องทำเอง (ทีละขั้น)</h2>
  ${note('warn', 'ยังขาดแค่ฝั่งฐานข้อมูล', '<p>โค้ดทั้งหมดพร้อมแล้ว แต่ต้องสร้างตาราง <code>members</code>, <code>carts</code>, <code>cartDtl</code> และตั้งค่าการเชื่อมต่อก่อน ถึงจะสมัครสมาชิก เข้าสู่ระบบ และใช้ตะกร้าได้จริง</p>')}

  <h3>ขั้นที่ 1 — เตรียม PostgreSQL <small>(หัวข้อ 2, 3.1)</small></h3>
  <ol>
    <li>ติดตั้งและเปิด PostgreSQL + pgAdmin 4</li>
    <li>ตรวจว่ามีฐานข้อมูล <code>kushop</code> ที่มีตาราง products/brands จากแลปก่อนหน้า</li>
  </ol>

  <h3>ขั้นที่ 2 — สร้าง user dev <small>(หัวข้อ 3.2, ข้ามได้ถ้าใช้ postgres)</small></h3>
  ${code('SQL (รันในฐานะ postgres)', "CREATE ROLE dev WITH LOGIN PASSWORD '1234';\nGRANT CONNECT ON DATABASE kushop TO dev;\nGRANT USAGE ON SCHEMA public TO dev;", 'sql')}

  <h3>ขั้นที่ 3 — สร้างตาราง members <small>(หัวข้อ 3.3–3.4)</small></h3>
  ${code('SQL (รันใน Query Tool ของ kushop)', `CREATE TABLE public.members (
    "memEmail" VARCHAR(100) NOT NULL PRIMARY KEY,
    "memName"  VARCHAR(100),
    "dutyId"   VARCHAR(100) DEFAULT 'member',
    "memHash"  VARCHAR(255)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO dev;`, 'sql')}
  <p>ต้องมีเครื่องหมาย <code>"</code> ครอบชื่อคอลัมน์ ไม่อย่างนั้นจะเจอ <code>column "memEmail" does not exist</code></p>

  <h3>ขั้นที่ 4 — สร้างตาราง carts และ cartDtl <small>(หัวข้อ 3.6, Lab 11)</small></h3>
  <p>ถ้าอาจารย์ให้ไฟล์ backup มา ให้ Restore ตาม Lab 11 หน้า 1 หรือรัน SQL นี้แทนก็ได้</p>
  ${code('SQL (รันใน Query Tool ของ kushop)', `CREATE TABLE public.carts (
    "cartId"   VARCHAR(100) NOT NULL PRIMARY KEY,   -- รหัสตะกร้า YYYYMMDD+ลำดับ
    "cusId"    VARCHAR(100),                        -- อีเมลของสมาชิกเจ้าของตะกร้า
    "cartDate" DATE,                                -- วันที่สร้างตะกร้า
    "cartCf"   BOOLEAN DEFAULT false                -- ยืนยันสั่งซื้อแล้วหรือยัง
);

CREATE TABLE public."cartDtl" (
    "cartId" VARCHAR(100) NOT NULL,
    "pdId"   VARCHAR(100) NOT NULL,
    "qty"    REAL,
    "price"  REAL,
    PRIMARY KEY ("cartId", "pdId")
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts, public."cartDtl" TO dev;`, 'sql')}

  <h3>ขั้นที่ 5 — ตรวจตาราง <small>(หัวข้อ 3.5)</small></h3>
  ${code('SQL', `SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('members', 'carts', 'cartDtl')
ORDER BY table_name, ordinal_position;`, 'sql')}
  <p>ต้องได้ครบ 4 + 4 + 4 คอลัมน์</p>

  <h3>ขั้นที่ 6 — เติมค่าเชื่อมต่อใน .env <small>(หัวข้อ 4)</small></h3>
  <p><code>.env</code> มี <code>PORT</code> และ <code>SECRET_KEY</code> อยู่แล้ว <b>ห้ามลบ</b> ให้เพิ่มเฉพาะค่าที่ไม่ตรงกับค่าเริ่มต้น (<code>localhost:5432</code>, <code>kushop</code>, <code>postgres</code>/<code>postgres</code>)</p>
  ${code('.env (เพิ่มต่อท้าย)', `DB_HOST=localhost
DB_PORT=5432
DB_NAME=kushop
DB_USER=dev
DB_PASSWORD=1234`, 'env')}

  <h3>ขั้นที่ 7 — รันระบบ <small>(หัวข้อ 11.1)</small></h3>
  ${code('2 terminal ในโฟลเดอร์โปรเจกต์', `npm run server   # terminal 1 → http://localhost:3000
npm run dev      # terminal 2 → http://localhost:5173`, 'bash')}
  <ul>
    <li>ถ้า server ตัวเก่าเปิดอยู่ ให้ปิด (Ctrl+C) แล้วเปิดใหม่ เพื่อให้อ่าน <code>.env</code> ใหม่</li>
    <li>เปิดเว็บด้วย <code>http://localhost:5173</code> เท่านั้น ห้ามใช้ <code>127.0.0.1</code> เพราะ cookie จะไม่ถูกส่ง</li>
  </ul>

  <h3>ขั้นที่ 8 — ทดสอบ <small>(หัวข้อ 6 และ 11.2)</small></h3>
  <p>ทดสอบ API ด้วย Postman ตามหัวข้อ 6 แล้วทดสอบบนหน้าเว็บตามรายการในหัวข้อ 11.2</p>
  ${note('', 'ติดปัญหา?', '<p>ดูตารางอาการ สาเหตุ และวิธีแก้ในหัวข้อ 12</p>')}
</section>

<section>
  <h2><span class="no">C</span>ติดตั้งบนเครื่องใหม่ (หลัง clone / pull)</h2>
  <p>ใช้ตอนย้ายโปรเจกต์ไปเครื่องอื่น GitHub เก็บเฉพาะโค้ด <b>สิ่งที่ไม่ได้ติดไปด้วย</b> มีดังนี้:</p>
  <table>
    <tr><th style="width:30%">สิ่งที่ไม่อยู่ใน git</th><th>เหตุผล</th><th style="width:30%">ต้องทำอะไร</th></tr>
    <tr><td><code>node_modules/</code></td><td>ไฟล์ใหญ่ ติดตั้งใหม่ได้จาก <code>package.json</code></td><td><code>npm install</code> (ขั้นที่ C.3)</td></tr>
    <tr><td><code>.env</code></td><td>มีรหัสผ่าน DB และ <code>SECRET_KEY</code> ห้ามขึ้น GitHub</td><td>สร้างใหม่ (ขั้นที่ C.4)</td></tr>
    <tr><td>ฐานข้อมูล <code>kushop</code></td><td>อยู่ใน PostgreSQL ของแต่ละเครื่อง ไม่ใช่ไฟล์ในโปรเจกต์</td><td>ย้ายหรือสร้างใหม่ (ขั้นที่ C.5)</td></tr>
  </table>

  <h3>C.1 ติดตั้งโปรแกรมบนเครื่องใหม่</h3>
  <table>
    <tr><th>โปรแกรม</th><th>ตรวจด้วยคำสั่ง</th></tr>
    <tr><td>Git</td><td><code>git --version</code></td></tr>
    <tr><td>Node.js ${esc(pkg.engines.node)}</td><td><code>node -v</code></td></tr>
    <tr><td>PostgreSQL + pgAdmin 4</td><td>เปิด pgAdmin แล้วเชื่อมต่อ server ได้</td></tr>
  </table>

  <h3>C.2 เอาโค้ดลงเครื่อง</h3>
  ${code('ครั้งแรก', `git clone https://github.com/Deepciony/WebT.git
cd WebT`, 'bash')}
  ${code('มีโปรเจกต์อยู่แล้ว', `git checkout main
git pull origin main`, 'bash')}

  <h3>C.3 ติดตั้ง package</h3>
  ${code('Terminal', 'npm install', 'bash')}
  <p>ต้องรันใหม่ทุกครั้งที่ pull แล้ว <code>package.json</code> เปลี่ยน</p>

  <h3>C.4 สร้างไฟล์ .env</h3>
  ${code('Terminal', `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`, 'bash')}
  ${code('.env', `PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=kushop
DB_USER=postgres
DB_PASSWORD=รหัสผ่าน-postgres-ของเครื่องนี้

SECRET_KEY=วางค่าที่สุ่มได้ตรงนี้`, 'env')}

  <h3>C.5 เตรียมฐานข้อมูลบนเครื่องใหม่</h3>
  <p>ต้องมีตาราง <code>products</code>, <code>brands</code>, <code>pdTypes</code>, <code>members</code>, <code>carts</code>, <code>cartDtl</code></p>
  ${code('เครื่องเดิม: export / เครื่องใหม่: import', `pg_dump -U postgres -d kushop -f kushop.sql          # เครื่องเดิม
createdb -U postgres kushop                          # เครื่องใหม่
psql -U postgres -d kushop -f kushop.sql             # เครื่องใหม่`, 'bash')}
  <p><b>อย่า commit ไฟล์ <code>kushop.sql</code> ขึ้น GitHub</b> เพราะมี hash รหัสผ่านสมาชิกอยู่ ถ้าไม่ย้ายข้อมูล ให้สร้างตารางใหม่ตามส่วน B ขั้นที่ 3–4</p>

  <h3>C.6 รันและอัปเดตครั้งต่อไป</h3>
  ${code('Terminal', `npm run server   # terminal 1
npm run dev      # terminal 2

git pull origin main
npm install          # ถ้า package.json เปลี่ยน
# ปิด npm run server (Ctrl+C) แล้วเปิดใหม่ เพื่อให้โค้ด backend ใหม่มีผล`, 'bash')}

  <h3>C.7 ปัญหาที่เจอบ่อยบนเครื่องใหม่</h3>
  <table>
    <tr><th style="width:34%">อาการ</th><th style="width:30%">สาเหตุ</th><th>วิธีแก้</th></tr>
    <tr><td>PowerShell: <code>npm.ps1 cannot be loaded</code></td><td>Windows ปิดการรันสคริปต์</td><td>ใช้ Command Prompt หรือรัน <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></td></tr>
    <tr><td><code>Cannot find module 'multer'</code> (หรือ package อื่น)</td><td>ยังไม่ได้ <code>npm install</code> หลัง pull</td><td>รัน <code>npm install</code></td></tr>
    <tr><td>server ไม่ขึ้น: <code>SECRET_KEY is missing</code></td><td>ไม่มีไฟล์ <code>.env</code> หรือไฟล์ผิดที่</td><td>ทำขั้นที่ C.4 ไฟล์ต้องอยู่ข้าง <code>server.js</code></td></tr>
    <tr><td><code>EADDRINUSE :::3000</code></td><td>มีโปรแกรมอื่นใช้ port 3000</td><td>ปิดโปรแกรมนั้น (หน้าเว็บเรียก API ที่ port 3000 ตายตัว)</td></tr>
    <tr><td>Vite เปิดที่ <code>5174</code> แล้วล็อกอินไม่ได้</td><td>port 5173 ถูกใช้อยู่ และ CORS อนุญาตแค่ 5173</td><td>ปิดโปรแกรมที่ใช้ 5173 หรือ <code>npm run dev -- --port 5173 --strictPort</code></td></tr>
    <tr><td><code>git push</code> ได้ 403</td><td>Windows จำบัญชี GitHub อื่นไว้</td><td>Credential Manager → ลบ <code>git:https://github.com</code> แล้ว push ใหม่</td></tr>
  </table>
</section>

<section>
  <h2><span class="no">1</span>ภาพรวมระบบ</h2>
  <p><b>Lab 09 (Authentication)</b> สมัครสมาชิกและเข้าสู่ระบบ โดยเก็บรหัสผ่านเป็นค่า hash ของ bcrypt ในตาราง <code>members</code></p>
  <p><b>Lab 10 (Authorization JWT)</b> เข้าสู่ระบบสำเร็จ backend สร้าง JWT ส่งกลับใน cookie แบบ <code>httpOnly</code> ทุกคำขอถัดไป browser จะแนบ cookie ไปด้วย backend จึงรู้ว่าใครใช้งานอยู่ โดยไม่ต้องเก็บสถานะที่ server</p>
  <p><b>Lab 11 (Transaction)</b> ตะกร้าสินค้าเก็บในฐานข้อมูล 2 ตาราง คือ <code>carts</code> (หัวตะกร้า) กับ <code>cartDtl</code> (รายการสินค้า) ผูกกับสมาชิกที่ล็อกอินอยู่</p>
  <div class="flow">
    <div><b>1. Login</b>ได้ cookie <code>token</code> อายุ 1 ชม.</div><span>→</span>
    <div><b>2. ใส่ตะกร้า</b>ตรวจตะกร้าค้าง ถ้าไม่มีสร้างใหม่ แล้วบันทึกสินค้า</div><span>→</span>
    <div><b>3. แก้ไข</b>เพิ่ม/ลดจำนวน ลบสินค้า หรือลบตะกร้า</div><span>→</span>
    <div><b>4. ยืนยัน</b>ตั้ง <code>cartCf</code> เป็น true ตะกร้าใบนั้นปิด</div>
  </div>
  <table>
    <tr><th>Endpoint</th><th>หน้าที่</th></tr>
    <tr><td><code>POST /members</code> · <code>POST /members/login</code></td><td>สมัครสมาชิก · เข้าสู่ระบบ (ตั้ง cookie)</td></tr>
    <tr><td><code>GET /members/detail</code> · <code>GET /members/logout</code></td><td>ถอด token · ลบ cookie</td></tr>
    <tr><td><code>POST /carts/chkcart</code> · <code>POST /carts/addcart</code></td><td>ตรวจตะกร้าค้าง · สร้างตะกร้า</td></tr>
    <tr><td><code>POST /carts/addcartdtl</code> · <code>PUT /carts/setcartdtlqty</code></td><td>ใส่สินค้า · แก้จำนวน</td></tr>
    <tr><td><code>DELETE /carts/delcartdtl/:id/:pdId</code> · <code>DELETE /carts/delcart/:id</code></td><td>ลบสินค้า · ลบตะกร้า</td></tr>
    <tr><td><code>PUT /carts/cfcart/:id</code></td><td>ยืนยันสั่งซื้อ</td></tr>
    <tr><td><code>GET /carts/sumcart/:id</code></td><td>ยอดรวมจำนวนและเงิน</td></tr>
    <tr><td><code>GET /carts/getcart/:id</code> · <code>GET /carts/getcartdtl/:id</code></td><td>หัวตะกร้า · รายการในตะกร้า</td></tr>
    <tr><td><code>POST /carts/getcartbycus</code></td><td>ตะกร้าทั้งหมดของสมาชิกที่ล็อกอิน</td></tr>
  </table>
</section>

<section>
  <h2><span class="no">2</span>สิ่งที่ต้องเตรียม</h2>
  <table>
    <tr><th>โปรแกรม</th><th>ใช้ทำอะไร</th></tr>
    <tr><td>Node.js ${esc(pkg.engines.node)}</td><td>รัน backend และ Vite</td></tr>
    <tr><td>PostgreSQL + pgAdmin 4</td><td>ฐานข้อมูล <code>kushop</code></td></tr>
    <tr><td>Postman (ไม่บังคับ)</td><td>ทดสอบ API ก่อนต่อกับหน้าเว็บ</td></tr>
    <tr><td>Google Chrome / Edge</td><td>ทดสอบหน้าเว็บ และดู cookie ใน DevTools</td></tr>
  </table>
  ${code('Terminal', 'npm install', 'bash')}
  <p>ถ้าทำเองจากโปรเจกต์เปล่า ให้ติดตั้งทีละตัวตามแลป:</p>
  ${code('Terminal', `npm install bcryptjs            # hash รหัสผ่าน (Lab 09)
npm install jsonwebtoken        # สร้าง/ตรวจ JWT (Lab 10)
npm install cookie-parser       # อ่าน cookie ฝั่ง backend (Lab 10)
npm install pinia               # state management ฝั่ง Vue (Lab 10-11)`, 'bash')}
  ${note('', 'ทำไมใช้ bcryptjs ไม่ใช่ bcrypt', '<p>โปรเจกต์นี้มี <code>bcryptjs</code> อยู่แล้ว วิธีเรียกใช้ (<code>hash</code>, <code>compare</code>) เหมือน <code>bcrypt</code> ทุกอย่าง และไม่ต้องคอมไพล์ native module บน Windows</p>')}
</section>

<section>
  <h2><span class="no">3</span>ฐานข้อมูล</h2>
  <p>ทำใน pgAdmin 4 ตามเอกสาร Lab 09 หน้า 2 และ Lab 11 หน้า 1–2 หรือรันคำสั่ง SQL ในส่วน B ขั้นที่ 3–4 แทนก็ได้ ผลเหมือนกัน</p>

  <h3>3.1 ตรวจว่ามีฐานข้อมูล kushop</h3>
  <ol class="steps">
    <li>เปิด pgAdmin แล้วเชื่อมต่อ server PostgreSQL</li>
    <li>ดูใน <b>Databases</b> ว่ามี <code>kushop</code> ถ้ายังไม่มี คลิกขวา <b>Databases → Create → Database…</b></li>
    <li>คลิกขวาที่ <code>kushop</code> → <b>Query Tool</b> เพื่อเปิดหน้าต่างรัน SQL</li>
  </ol>

  <h3>3.2 สร้าง login role dev</h3>
  <p>เอกสารแลปใช้ user <code>dev</code> รหัส <code>1234</code> ถ้าจะใช้ <code>postgres</code> ก็ข้ามได้ (SQL อยู่ในส่วน B ขั้นที่ 2)</p>

  <h3>3.3 ตาราง members <small>(Lab 09)</small></h3>
  <table>
    <tr><th>Name</th><th>Data type</th><th>Length</th><th>Not NULL?</th><th>Primary key?</th><th>Default</th></tr>
    <tr><td><code>memEmail</code></td><td>character varying</td><td>100</td><td>✔</td><td>✔</td><td></td></tr>
    <tr><td><code>memName</code></td><td>character varying</td><td>100</td><td></td><td></td><td></td></tr>
    <tr><td><code>dutyId</code></td><td>character varying</td><td>100</td><td></td><td></td><td><code>'member'</code></td></tr>
    <tr><td><code>memHash</code></td><td>character varying</td><td>255</td><td></td><td></td><td></td></tr>
  </table>

  <h3>3.4 ตาราง carts <small>(Lab 11)</small></h3>
  <table>
    <tr><th>Name</th><th>Data type</th><th>Length</th><th>Not NULL?</th><th>Primary key?</th><th>ความหมาย</th></tr>
    <tr><td><code>cartId</code></td><td>character varying</td><td>100</td><td>✔</td><td>✔</td><td>รหัสตะกร้า</td></tr>
    <tr><td><code>cusId</code></td><td>character varying</td><td>100</td><td></td><td></td><td>อีเมลสมาชิกเจ้าของตะกร้า</td></tr>
    <tr><td><code>cartDate</code></td><td>date</td><td></td><td></td><td></td><td>วันที่สร้างตะกร้า</td></tr>
    <tr><td><code>cartCf</code></td><td>boolean</td><td></td><td></td><td></td><td>ยืนยันสั่งซื้อแล้วหรือยัง (default <code>false</code>)</td></tr>
  </table>

  <h3>3.5 ตาราง cartDtl <small>(Lab 11)</small></h3>
  <table>
    <tr><th>Name</th><th>Data type</th><th>Length</th><th>Not NULL?</th><th>Primary key?</th><th>ความหมาย</th></tr>
    <tr><td><code>cartId</code></td><td>character varying</td><td>100</td><td>✔</td><td>✔</td><td>รหัสตะกร้า</td></tr>
    <tr><td><code>pdId</code></td><td>character varying</td><td>100</td><td>✔</td><td>✔</td><td>รหัสสินค้า</td></tr>
    <tr><td><code>qty</code></td><td>real</td><td></td><td></td><td></td><td>จำนวน</td></tr>
    <tr><td><code>price</code></td><td>real</td><td></td><td></td><td></td><td>ราคาต่อหน่วยตอนใส่ตะกร้า</td></tr>
  </table>

  <h3>3.6 กำหนดสิทธิ์</h3>
  <p>คลิกขวาที่ตาราง → <b>Properties → Security</b> แล้วให้สิทธิ์ INSERT, SELECT, UPDATE, DELETE กับ <code>dev</code> หรือรัน:</p>
  ${code('SQL', 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.members, public.carts, public."cartDtl" TO dev;', 'sql')}
  ${note('warn', 'ต้องมีเครื่องหมาย " รอบชื่อคอลัมน์', '<p>PostgreSQL จะแปลงชื่อที่ไม่มี <code>"</code> เป็นตัวพิมพ์เล็กทั้งหมด (<code>cartId</code> → <code>cartid</code>) แต่ controller query ด้วย <code>"cartId"</code> ถ้าสร้างผิดจะเจอ error <code>column "cartId" does not exist</code></p>')}
</section>

<section>
  <h2><span class="no">4</span>ตั้งค่าไฟล์ .env</h2>
  <p>สร้างไฟล์ <code>.env</code> ที่โฟลเดอร์หลักของโปรเจกต์ (ระดับเดียวกับ <code>server.js</code>) ไฟล์นี้อยู่ใน <code>.gitignore</code> แล้ว จะไม่ถูก commit</p>
  ${code('.env', `PORT=3000

# การเชื่อมต่อฐานข้อมูล (ชื่อตัวแปรตาม database.js ของโปรเจกต์นี้)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kushop
DB_USER=dev
DB_PASSWORD=1234

# กุญแจลับสำหรับเซ็น JWT
SECRET_KEY=ใส่ค่าสุ่มยาวๆ-ที่นี่`, 'env')}
  ${code('server/database.js', read('server/database.js'), 'js')}
  ${code('สุ่มค่า SECRET_KEY', `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`, 'bash')}
  ${note('danger', 'ห้ามเปิดเผย SECRET_KEY', '<p>ใครรู้ค่านี้ สร้าง token ปลอมเป็นสมาชิกคนไหนก็ได้ อย่าใช้ค่าง่ายๆ ในงานจริง และอย่า commit ไฟล์ <code>.env</code> ถ้า server เปิดโดยไม่มี <code>SECRET_KEY</code> จะหยุดทำงานพร้อมข้อความ <code>SECRET_KEY is missing</code></p>')}
</section>

<section>
  <h2><span class="no">5</span>Backend สมาชิก</h2>
  <table>
    <tr><th>ฟังก์ชัน</th><th>แลป</th><th>ทำอะไร</th></tr>
    <tr><td><code>postMember</code></td><td>09</td><td>ตรวจข้อมูลครบ → ตรวจอีเมลซ้ำ → hash รหัสผ่าน (salt 11) → INSERT</td></tr>
    <tr><td><code>loginMember</code></td><td>09 + 10</td><td>หาอีเมล → <code>bcrypt.compare</code> → สำเร็จ: <code>jwt.sign</code> + <code>res.cookie</code> / ล้มเหลว: <code>res.clearCookie</code></td></tr>
    <tr><td><code>getMember</code></td><td>10</td><td>อ่าน <code>req.cookies.token</code> → <code>jwt.verify</code> → ส่งข้อมูลสมาชิก</td></tr>
    <tr><td><code>logoutMember</code></td><td>10</td><td><code>res.clearCookie('token')</code></td></tr>
  </table>
  ${code('controllers/memberController.js', memberController, 'js')}
  ${code('server/routes/memberRoute.js', read('server/routes/memberRoute.js'), 'js')}

  <h3>server.js</h3>
  <ul>
    <li><b>CORS แบบระบุโดเมน</b> พร้อม <code>credentials: true</code> เพื่อให้ browser ส่ง cookie ข้าม port ได้</li>
    <li><b><code>app.use(cookieParser())</code></b> ต้องเรียก <u>ก่อน</u> router ไม่อย่างนั้น <code>req.cookies</code> จะว่าง</li>
    <li>เรียกใช้ <code>memberRoutes</code> และ <code>cartRoutes</code></li>
  </ul>
  ${code('server/index.js', read('server/index.js'), 'js')}
</section>

<section>
  <h2><span class="no">6</span>ทดสอบ Backend ด้วย Postman</h2>
  <p>เปิด backend ด้วย <code>npm run server</code> แล้วตั้ง Body เป็น <b>raw → JSON</b></p>
  <table>
    <tr><th style="width:26%">Request</th><th style="width:42%">Body</th><th>ผลที่ควรได้</th></tr>
    <tr><td><code>POST /members</code></td><td><code>{"memEmail":"test1@gmail.com","memName":"Mr.First","password":"1234"}</code></td><td><code>Regist Success</code> · ส่งซ้ำได้ <code>ERROR memEmail ... is exists.</code></td></tr>
    <tr><td><code>POST /members/login</code></td><td><code>{"loginName":"test1@gmail.com","password":"1234"}</code></td><td><code>Login Success</code> + cookie <code>token</code></td></tr>
    <tr><td><code>GET /members/detail</code></td><td>–</td><td>ข้อมูลสมาชิก + <code>login: true</code></td></tr>
    <tr><td><code>GET /members/logout</code></td><td>–</td><td>เรียก detail ซ้ำได้ <code>No member</code></td></tr>
    <tr><td><code>POST /carts/chkcart</code></td><td><code>{}</code></td><td><code>cartExist</code> จริง/เท็จ (ไม่มี cookie ได้ <code>Login is required</code>)</td></tr>
    <tr><td><code>POST /carts/addcart</code></td><td><code>{}</code></td><td><code>cartOK: true</code> + เลขตะกร้า</td></tr>
    <tr><td><code>POST /carts/addcartdtl</code></td><td><code>{"cartId":"...","pdId":"4"}</code></td><td><code>cartDtlOK: true</code></td></tr>
    <tr><td><code>GET /carts/sumcart/:id</code></td><td>–</td><td><code>{ id, qty, money }</code></td></tr>
  </table>
  <p>ใน pgAdmin คอลัมน์ <code>memHash</code> ต้องขึ้นต้นด้วย <code>$2</code> (เป็น hash ไม่ใช่รหัสผ่านจริง) และแถวใน <code>cartDtl</code> ต้องมีราคาตรงกับตาราง <code>products</code></p>
  <table>
    <tr><th>กรณี</th><th>ผลลัพธ์</th></tr>
    <tr><td>ไม่มี cookie</td><td><code>{"message":"No member","login":false}</code> / <code>Login is required</code></td></tr>
    <tr><td>แก้ค่า token แม้แต่ตัวเดียว</td><td><code>The information was falsified.</code></td></tr>
    <tr><td>ขอดูตะกร้าของคนอื่น</td><td>ได้ผลลัพธ์ว่าง (<code>[]</code>)</td></tr>
    <tr><td>แก้ตะกร้าที่ยืนยันสั่งซื้อแล้ว</td><td><code>This cart cannot be changed</code></td></tr>
  </table>
</section>

<section>
  <h2><span class="no">7</span>Frontend: Pinia, authStore, Router</h2>
  <h3>7.1 src/main.js</h3>
  <p>ติดตั้ง Pinia และตั้ง <code>axios.defaults.withCredentials = true</code> <b>ครั้งเดียวที่นี่</b> ถ้าไม่ตั้ง browser จะไม่ส่ง/รับ cookie ข้าม port</p>
  ${code('src/main.js', read('src/main.js'), 'js')}

  <h3>7.2 src/stores/authStore.js</h3>
  ${code('src/stores/authStore.js', read('src/stores/authStore.js'), 'js')}

  <h3>7.3 src/router/index.js</h3>
  <ul>
    <li><code>meta.requiresAuth</code> = ต้องล็อกอินก่อน, <code>meta.guestOnly</code> = เฉพาะคนที่ยังไม่ล็อกอิน</li>
    <li><code>beforeEach</code> เช็ก cookie ผ่าน <code>authStore.getMember()</code> ครั้งแรกที่เปิดเว็บ แล้วตัดสินว่าจะให้ไปหน้าไหน</li>
    <li>route ของ Lab 11: <code>/productshow/:pdId</code>, <code>/cartshow/:cartId</code>, <code>/cartlist</code></li>
  </ul>
  ${code('src/router/index.js', read('src/router/index.js'), 'js')}
</section>

<section>
  <h2><span class="no">8</span>Frontend: หน้าสมาชิก</h2>
  <h3>8.1 TheLogin.vue</h3>
  ${code('src/pages/TheLogin.vue', noStyle(read('src/pages/TheLogin.vue')), 'vue')}

  <h3>8.2 TheRegister.vue</h3>
  ${code('src/pages/TheRegister.vue', noStyle(read('src/pages/TheRegister.vue')), 'vue')}

  <h3>8.3 PageMember.vue</h3>
  ${code('src/pages/PageMember.vue (ไม่รวม CSS)', noStyle(read('src/pages/PageMember.vue')), 'vue')}

  <h3>8.4 MainMenu.vue</h3>
  ${code('src/components/MainMenu.vue — ส่วน script', menuScript, 'vue')}
  ${code('src/components/MainMenu.vue — รายการเมนู (ธีมคลาสสิก)', menuItems, 'vue')}
</section>

<section>
  <h2><span class="no">9</span>Lab 11 Backend: ตะกร้าสินค้า</h2>
  <p>ทุก endpoint อ่านเจ้าของตะกร้าจาก token ใน cookie ไม่ใช่จาก body และตรวจว่าตะกร้าเป็นของคนที่ล็อกอินอยู่จริง</p>
  <table>
    <tr><th>ฟังก์ชัน</th><th>ทำอะไร</th></tr>
    <tr><td><code>readMember</code> / <code>ownsCart</code> / <code>canEditCart</code></td><td>อ่านสมาชิกจาก token · ตรวจเจ้าของ · ตรวจว่าตะกร้ายังไม่ถูกยืนยัน</td></tr>
    <tr><td><code>chkCart</code></td><td>หาตะกร้าที่ยังไม่ยืนยัน (<code>cartCf != true</code>) ของสมาชิกคนนี้</td></tr>
    <tr><td><code>postCart</code></td><td>สร้างเลขตะกร้า <code>YYYYMMDD</code> + ลำดับ 4 หลัก แล้ว INSERT (ถ้ามีตะกร้าค้างอยู่แล้วคืนใบเดิม)</td></tr>
    <tr><td><code>postCartDtl</code></td><td>มีสินค้าตัวเดียวกันอยู่แล้วให้บวกจำนวน ถ้ายังไม่มีให้ INSERT ราคาดึงจากตาราง <code>products</code></td></tr>
    <tr><td><code>setCartDtlQty</code> / <code>delCartDtl</code> / <code>delCart</code></td><td>แก้จำนวน · ลบสินค้า · ลบตะกร้าทั้งใบ</td></tr>
    <tr><td><code>cfCart</code></td><td>ยืนยันสั่งซื้อ: ตั้ง <code>cartCf</code> เป็น true (ตะกร้าว่างยืนยันไม่ได้)</td></tr>
    <tr><td><code>sumCart</code> / <code>getCart</code> / <code>getCartDtl</code> / <code>getCartByCus</code></td><td>ยอดรวม · หัวตะกร้า · รายการในตะกร้า · ตะกร้าทั้งหมดของสมาชิก</td></tr>
  </table>
  ${code('controllers/cartController.js', cartController, 'js')}
  ${code('server/routes/cartRoute.js', read('server/routes/cartRoute.js'), 'js')}
</section>

<section>
  <h2><span class="no">10</span>Lab 11 Frontend: ตะกร้าสินค้า</h2>
  <h3>10.1 src/stores/cartStore.js</h3>
  <p>Store กลางของตะกร้า เก็บเลขตะกร้า จำนวนชิ้น และยอดเงิน ให้ทุก component ใช้ร่วมกัน</p>
  ${code('src/stores/cartStore.js', read('src/stores/cartStore.js'), 'js')}

  <h3>10.2 ProductShow.vue <small>(หน้ารายละเอียดสินค้า)</small></h3>
  <p>อ่าน <code>route.params.pdId</code> แล้วเรียก <code>GET /products/:id</code> ปุ่มใส่ตะกร้าจะตรวจการล็อกอินก่อน แล้วเรียก <code>cartStore.addProduct()</code> ซึ่งจะตรวจตะกร้าค้าง สร้างตะกร้าถ้ายังไม่มี และบันทึกสินค้าให้ตามลำดับ</p>
  ${code('src/pages/ProductShow.vue (ไม่รวม CSS)', noStyle(read('src/pages/ProductShow.vue')), 'vue')}

  <h3>10.3 CartInfo.vue <small>(ปุ่มตะกร้าบนเมนู)</small></h3>
  ${code('src/components/layout/CartInfo.vue (ไม่รวม CSS)', noStyle(read('src/components/layout/CartInfo.vue')), 'vue')}

  <h3>10.4 CartShow.vue <small>(รายละเอียดตะกร้า)</small></h3>
  <p>อ่านหัวตะกร้ากับรายการสินค้าพร้อมกัน ถ้าตะกร้าไม่ใช่ของผู้ใช้คนนี้ API จะคืนค่าว่างและหน้าจะขึ้นว่าไม่มีสิทธิ์ดู ตะกร้าที่ยืนยันแล้วจะซ่อนปุ่มแก้ไขทั้งหมด</p>
  ${code('src/pages/CartShow.vue — ส่วน script', scriptOnly(read('src/pages/CartShow.vue')), 'vue')}

  <h3>10.5 CartList.vue <small>(ตะกร้าทั้งหมดที่เคยสั่ง)</small></h3>
  ${code('src/pages/CartList.vue (ไม่รวม CSS)', noStyle(read('src/pages/CartList.vue')), 'vue')}
</section>

<section>
  <h2><span class="no">11</span>รันและทดสอบทั้งระบบ</h2>
  <h3>11.1 เปิดโปรแกรม (2 terminal)</h3>
  ${code('Terminal 1 — Backend', 'npm run server\n# API server is running at http://localhost:3000', 'bash')}
  ${code('Terminal 2 — Frontend', 'npm run dev\n# Local: http://localhost:5173/', 'bash')}
  ${note('warn', 'เปิดเว็บด้วย http://localhost:5173 เท่านั้น', '<p>cookie ตั้งค่า <code>sameSite: strict</code> ถ้าเปิดด้วย <code>127.0.0.1:5173</code> browser จะมองว่า <code>localhost:3000</code> เป็นคนละเว็บ แล้วไม่ส่ง cookie ทำให้ล็อกอินแล้วหลุดทันที</p>')}

  <h3>11.2 รายการทดสอบ</h3>
  <p>ข้อความในตารางเป็นข้อความเมื่อเลือกภาษา <b>ไทย</b> (ปุ่ม EN / ไทย มุมบนขวา) ค่าเริ่มต้นของเว็บเป็นภาษาอังกฤษ</p>
  <table class="check">
    <tr><th>✓</th><th>ทำอะไร</th><th>ผลที่ควรได้</th></tr>
    <tr><td>☐</td><td>เปิด <code>http://localhost:5173/</code> ตอนยังไม่ล็อกอิน</td><td>ถูกพาไป <code>/login</code></td></tr>
    <tr><td>☐</td><td>กด "ยังไม่มีบัญชี? ลงทะเบียนใหม่" แล้วสมัคร</td><td>ข้อความ "ลงทะเบียนสำเร็จ" และมีแถวใหม่ในตาราง <code>members</code></td></tr>
    <tr><td>☐</td><td>ล็อกอินด้วยรหัสผิด / รหัสถูก</td><td>"อีเมลหรือรหัสผ่านไม่ถูกต้อง" / ไปหน้า <code>/pagemember</code></td></tr>
    <tr><td>☐</td><td>F12 → Application → Cookies</td><td>มี <code>token</code> ติ๊ก HttpOnly และ Secure</td></tr>
    <tr><td>☐</td><td>หน้าสินค้า กด "ดูรายละเอียด"</td><td>ไปหน้า <code>/productshow/:pdId</code> เห็นราคา ยี่ห้อ รายละเอียด</td></tr>
    <tr><td>☐</td><td>กด "เพิ่มลงตะกร้า"</td><td>ปุ่มตะกร้าบนเมนูขึ้นจำนวนและยอดเงิน · ตาราง <code>carts</code> มีแถวใหม่ และ <code>cartDtl</code> มีสินค้า</td></tr>
    <tr><td>☐</td><td>กดปุ่มตะกร้าบนเมนู</td><td>ไปหน้า <code>/cartshow/:cartId</code> เห็นรายการสินค้าและยอดรวม</td></tr>
    <tr><td>☐</td><td>กดปุ่ม + / − และปุ่ม ×</td><td>จำนวนและยอดรวมเปลี่ยนตาม · ลบสินค้าออกจากตะกร้าได้</td></tr>
    <tr><td>☐</td><td>ใส่สินค้าตัวเดิมซ้ำ</td><td>จำนวนบวกเพิ่มในแถวเดิม ไม่เกิดแถวใหม่</td></tr>
    <tr><td>☐</td><td>กด "ยืนยันสั่งสินค้า"</td><td>ตะกร้าเปลี่ยนสถานะเป็น "สั่งซื้อแล้ว" ปุ่มแก้ไขหายไป และ <code>cartCf</code> ในฐานข้อมูลเป็น true</td></tr>
    <tr><td>☐</td><td>ใส่สินค้าใหม่หลังยืนยัน</td><td>ระบบสร้างตะกร้าใบใหม่ให้</td></tr>
    <tr><td>☐</td><td>เข้าเมนู "คำสั่งซื้อ"</td><td>เห็นตะกร้าทุกใบของตัวเอง เรียงจากล่าสุด</td></tr>
    <tr><td>☐</td><td>กดออกจากระบบ</td><td>ไปหน้า <code>/login</code>, cookie <code>token</code> หายไป</td></tr>
  </table>
</section>

<section>
  <h2><span class="no">12</span>ปัญหาที่พบบ่อยและวิธีแก้</h2>
  <table>
    <tr><th style="width:32%">อาการ / ข้อความ</th><th style="width:30%">สาเหตุ</th><th>วิธีแก้</th></tr>
    <tr><td>หน้าเว็บขึ้น "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ" / <code>Server error</code></td><td>PostgreSQL ไม่ได้เปิด หรือค่าใน <code>.env</code> ผิด</td><td>เปิด service PostgreSQL ตรวจ <code>DB_*</code> แล้วรีสตาร์ต <code>npm run server</code></td></tr>
    <tr><td><code>relation "members" does not exist</code> / <code>"carts"</code> / <code>"cartDtl"</code></td><td>ยังไม่ได้สร้างตาราง หรือสร้างผิดฐานข้อมูล</td><td>ทำส่วน B ขั้นที่ 3–4 ในฐานข้อมูลที่ตรงกับ <code>DB_NAME</code></td></tr>
    <tr><td><code>column "cartId" does not exist</code></td><td>สร้างคอลัมน์โดยไม่มี <code>"</code> จึงกลายเป็นตัวพิมพ์เล็ก</td><td>ลบตารางแล้วสร้างใหม่ตาม SQL ในส่วน B</td></tr>
    <tr><td><code>permission denied for table carts</code></td><td>user <code>dev</code> ไม่มีสิทธิ์</td><td>รัน <code>GRANT</code> ในหัวข้อ 3.6</td></tr>
    <tr><td>กดใส่ตะกร้าแล้วขึ้นว่าต้องเข้าสู่ระบบ</td><td>cookie หมดอายุ (1 ชม.) หรือถูกลบ</td><td>ล็อกอินใหม่</td></tr>
    <tr><td><code>This cart cannot be changed</code></td><td>ตะกร้าใบนั้นยืนยันสั่งซื้อไปแล้ว</td><td>ใส่สินค้าใหม่ ระบบจะสร้างตะกร้าใบใหม่ให้</td></tr>
    <tr><td>ปุ่มตะกร้าบนเมนูไม่อัปเดตจำนวน</td><td>ยังไม่ได้รีเฟรช store</td><td>ปกติจะอัปเดตเอง ถ้าไม่ขึ้นให้รีเฟรชหน้า (F5)</td></tr>
    <tr><td>server ไม่ขึ้น: <code>SECRET_KEY is missing</code></td><td>ไม่มี <code>SECRET_KEY</code> ใน <code>.env</code></td><td>เพิ่มค่าตามหัวข้อ 4</td></tr>
    <tr><td>Console: <code>blocked by CORS policy</code></td><td>origin ของหน้าเว็บไม่อยู่ใน whitelist</td><td>เพิ่ม origin นั้นใน <code>cors({ origin: [...] })</code> ของ <code>server.js</code></td></tr>
    <tr><td><code>req.cookies</code> เป็น <code>undefined</code></td><td>เรียก <code>cookieParser()</code> หลัง router</td><td>ย้าย <code>app.use(cookieParser())</code> ไปก่อน router</td></tr>
  </table>
</section>


<section>
  <h2><span class="no">D</span>ผังโครงสร้างไฟล์</h2>
  <p>โปรเจกต์นี้เก็บ backend กับ frontend ไว้ใน repo เดียว ใช้ <code>package.json</code> ตัวเดียว แยกกันที่โฟลเดอร์และคำสั่งรัน</p>
  ${code('โครงสร้างไฟล์ทั้งหมด (ไม่รวม node_modules และ dist)', `WebT/
├── package.json              สคริปต์: dev (frontend), server (backend), build, preview
├── vite.config.js            ตั้งค่า Vite
├── index.html                หน้า host ของ Vue (โหลดฟอนต์, data-theme="sky")
├── .env                      SECRET_KEY + ค่าเชื่อม PostgreSQL  ← ไม่ขึ้น git ต้องสร้างเอง
│
├── server/                   ===== BACKEND (Express, port 3000) =====
│   ├── index.js              จุดเริ่ม: CORS, cookie-parser, static, ผูก route ทั้งหมด
│   ├── database.js           pg Pool อ่านค่าจาก .env
│   ├── controllers/
│   │   ├── authMiddleware.js requireLogin: ตรวจ JWT ใน cookie แล้วใส่ req.member
│   │   ├── memberController.js  สมัคร / login / logout / แก้โปรไฟล์ / อัปโหลด-ลบรูป (Lab 09, 10, 12)
│   │   ├── productController.js CRUD สินค้า + รูปสินค้า + ค้นหา
│   │   ├── cartController.js    ตะกร้าทั้งชุดตาม Lab 11
│   │   └── databaseController.js  ดูทุกตาราง + ลบ member / cart / แถวตารางอ้างอิง
│   ├── swagger.yaml          OpenAPI spec ที่ Swagger UI อ่าน (/api-docs)
│   └── routes/
│       ├── memberRoute.js    /members/*
│       ├── productRoute.js   /products/*, /search/products/:id
│       ├── cartRoute.js      /carts/*
│       └── databaseRoute.js  /database/*
│
├── src/                      ===== FRONTEND (Vue 3 + Vite, port 5173) =====
│   ├── main.js               createApp + Pinia + Router + axios.withCredentials
│   ├── App.vue               MainMenu + router-view
│   ├── i18n.js               คำแปล EN/TH ทุกข้อความ + แปลข้อความที่ API ส่งมา
│   ├── router/index.js        เส้นทางหน้าเว็บ + guard requiresAuth / guestOnly
│   ├── stores/
│   │   ├── authStore.js      สถานะ login และข้อมูลสมาชิก
│   │   └── cartStore.js      ตะกร้าในฐานข้อมูล + ตะกร้า guest ใน localStorage
│   ├── pages/                หนึ่งไฟล์ = หนึ่งหน้าใน router
│   │   ├── TheHome.vue          หน้าแรก
│   │   ├── PageProduct.vue      รายการสินค้า + ค้นหา + ฟิลเตอร์
│   │   ├── ProductShow.vue      รายละเอียดสินค้า
│   │   ├── ProductManage.vue    เพิ่ม / แก้ / ลบสินค้า + อัปโหลดรูปสินค้า
│   │   ├── CartShow.vue         ตะกร้าใบเดียว (แก้จำนวน ลบ ยืนยันสั่งซื้อ)
│   │   ├── CartList.vue         ประวัติคำสั่งซื้อ + ตะกร้าก่อนล็อกอิน
│   │   ├── DatabaseOverview.vue ดูทุกตาราง + ลบข้อมูล
│   │   ├── PageMember.vue       โปรไฟล์ + รูปสมาชิก (Lab 12)
│   │   ├── TheLogin.vue         เข้าสู่ระบบ
│   │   └── TheRegister.vue      สมัครสมาชิก
│   ├── components/
│   │   ├── layout/           MainMenu, AuthLayout, CartInfo, AppSwitches
│   │   └── ui/               ProductCard, SkySelect, SkyRange, SegmentSwitch, SkyIcon, DevBypass
│   └── assets/               base.css, main.css, skylearn.css (ดีไซน์หลัก + คลาส .sk-* ที่ใช้ร่วมกัน)
│
├── img_pd/                   รูปสินค้า (backend เสิร์ฟที่ /img_pd)
├── img_mem/                  รูปสมาชิก: default.jpg + avatar-1..3.jpg
│                             (รูปที่สมาชิกอัปโหลดถูก .gitignore ไว้)
├── public/favicon.ico
├── dist/                     ผลลัพธ์ npm run build → เอาไป copy ลง NGINX
└── docs/
    ├── Lab09-12-Guide.pdf    เอกสารฉบับนี้
    ├── build-guide.mjs       สคริปต์สร้าง PDF ฉบับนี้ (node docs/build-guide.mjs)
    └── nginx.conf.example    ตัวอย่าง config สำหรับ deploy`)}
  ${note('tip', 'จำง่าย ๆ', 'โค้ดที่รันบนเซิร์ฟเวอร์อยู่ใน <code>server/</code> ทั้งหมด โค้ดที่รันในเบราว์เซอร์อยู่ใน <code>src/</code> ทั้งหมด ไฟล์รูปและ <code>.env</code> อยู่ที่ราก')}
  <table>
    <tr><th style="width:26%">อยากแก้อะไร</th><th>ไปที่ไฟล์</th></tr>
    <tr><td>เพิ่ม API ใหม่</td><td><code>server/controllers/…</code> เขียนฟังก์ชัน แล้วผูกใน <code>server/routes/…</code></td></tr>
    <tr><td>เพิ่มหน้าใหม่</td><td>สร้างไฟล์ใน <code>src/pages/</code> แล้วเพิ่ม route ใน <code>src/router/index.js</code></td></tr>
    <tr><td>แก้ข้อความบนหน้าเว็บ</td><td><code>src/i18n.js</code> (ต้องแก้ทั้งบล็อก en และ th)</td></tr>
    <tr><td>แก้สี ฟอนต์ ปุ่ม</td><td><code>src/assets/skylearn.css</code></td></tr>
    <tr><td>แก้เมนูด้านบน</td><td><code>src/components/layout/MainMenu.vue</code></td></tr>
  </table>
</section>

<section>
  <h2><span class="no">13</span>Lab 12: อัปโหลดและแสดงรูปสมาชิก</h2>
  <p>รูปสมาชิกเก็บเป็นไฟล์ในโฟลเดอร์ <code>img_mem</code> ไม่ได้เก็บลงฐานข้อมูล ชื่อไฟล์คืออีเมลของสมาชิก เช่น <code>a@ku.th.jpg</code> ใครยังไม่มีรูปจะใช้ <code>default.jpg</code></p>

  <h3>Backend</h3>
  <ol>
    <li>สร้างโฟลเดอร์ <code>img_mem</code> ที่รากโปรเจกต์ แล้วใส่ <code>default.jpg</code></li>
    <li>เปิดเป็น static path ใน <code>server/index.js</code></li>
    <li>ติดตั้ง <code>multer</code> (<code>npm install multer</code>) แล้วเขียนตัวรับไฟล์</li>
  </ol>
  ${code('server/index.js — เปิดโฟลเดอร์รูปให้เข้าถึงได้', serverIndex.split('\n').filter((line) => line.includes('express.static')).join('\n'), 'js')}
  ${code('server/controllers/memberController.js — ตั้งค่า multer', memberController.slice(memberController.indexOf('// The photo is named'), memberController.indexOf('export async function deleteMemberPhoto')).trimEnd(), 'js')}
  ${code('server/controllers/memberController.js — ตัวรับไฟล์และตัวลบรูป', [fn(memberController, 'uploadMemberPhoto'), '', fn(memberController, 'deleteMemberPhoto')].join('\n'), 'js')}
  ${code('server/routes/memberRoute.js — สองเส้นทางที่เพิ่ม', `router.post("/members/uploadimg", requireLogin, memberC.uploadMemberPhoto);
router.delete("/members/photo", requireLogin, memberC.deleteMemberPhoto);`, 'js')}
  ${note('warn', 'ต่างจากเอกสารแลปตรงนี้', 'แลปตั้งชื่อไฟล์จาก <code>req.body.memEmail</code> ที่ส่งมากับฟอร์ม ใครก็แก้ค่านั้นเป็นอีเมลคนอื่นแล้วทับรูปคนอื่นได้ หรือใส่ <code>../..</code> เพื่อเขียนไฟล์นอกโฟลเดอร์ ในโปรเจกต์นี้ชื่อไฟล์มาจาก token (<code>req.member.memEmail</code>) กรองตัวอักษรที่ใช้ไม่ได้ทิ้ง จำกัดขนาด 5 MB และรับเฉพาะ jpeg / png / webp')}

  <h3>Frontend</h3>
  <p>หน้า <code>src/pages/PageMember.vue</code> แสดงรูป มีฟอร์มอัปโหลด ปุ่มลบรูป และอวาตาร์สำเร็จรูปให้เลือก</p>
  ${code('PageMember.vue — ส่งไฟล์ด้วย FormData', constFn(scriptOnly(pageMember), 'sendPhoto'), 'js')}
  ${code('PageMember.vue — URL ของรูปและการกันแคช', scriptOnly(pageMember).split('\n').filter((line) => /photoUrl|photoStamp|photoPath\.value = member/.test(line)).join('\n'), 'js')}
  ${note('tip', 'ทำไมต้องมี ?t=', 'ถ้าอัปโหลดรูปใหม่ทับชื่อไฟล์เดิม เบราว์เซอร์จะยังโชว์รูปเก่าจากแคช จึงต่อท้าย URL ด้วยเวลาปัจจุบัน (<code>?t=1735…</code>) ทุกครั้งที่อัปโหลดสำเร็จ URL เปลี่ยน เบราว์เซอร์จึงโหลดรูปใหม่')}
  ${note('tip', 'ต่างจากแลป: ไม่ต้องเดานามสกุลไฟล์', 'แลปใช้ <code>new Image()</code> ลองโหลด <code>&lt;email&gt;.jpg</code> เพื่อดูว่ามีรูปไหม โปรเจกต์นี้เก็บนามสกุลจริง (png อัปโหลดมาก็เก็บเป็น .png) แล้วให้ <code>GET /members/detail</code> ตอบ <code>photo</code> เป็น path ของไฟล์จริงมาเลย หน้าเว็บจึงไม่ต้องเดา')}
</section>

<section>
  <h2><span class="no">14</span>Lab 12: Deploy ด้วย NGINX</h2>
  <ol>
    <li>โหลด NGINX for Windows จาก <b>nginx.org/en/download.html</b> แตกไฟล์ไว้โฟลเดอร์ที่ต้องการ</li>
    <li>ที่โปรเจกต์สั่ง <code>npm run build</code> จะได้โฟลเดอร์ <code>dist/</code></li>
    <li>copy ทุกไฟล์ใน <code>dist/</code> ไปไว้ใน <code>&lt;nginx&gt;/html/</code></li>
    <li>แก้ <code>&lt;nginx&gt;/conf/nginx.conf</code> ตามตัวอย่างด้านล่าง แล้วตรวจไวยากรณ์ด้วย <code>nginx -t</code></li>
    <li>สั่ง <code>start nginx</code> แล้วเปิด <b>http://localhost</b> (ต้องรัน backend <code>npm run server</code> ไว้ด้วย)</li>
  </ol>
  ${code('nginx.conf (ส่วน server)', nginxConf.split('\n').filter((line) => !line.startsWith('#')).join('\n').trim(), 'nginx')}
  ${note('warn', 'ห้ามลืม try_files', 'Vue Router ใช้ history mode ถ้าไม่ใส่ <code>try_files $uri $uri/ /index.html;</code> พอเปิด <code>localhost/cartlist</code> ตรง ๆ หรือกด refresh จะได้ 404 เพราะ NGINX หาไฟล์ชื่อ cartlist ไม่เจอ')}
  ${code('server/index.js — CORS ต้องรับ origin ของ NGINX และ preview ด้วย', serverIndex.slice(serverIndex.indexOf('app.use(cors('), serverIndex.indexOf('app.use(express.json())')).trimEnd(), 'js')}
  <table>
    <tr><th style="width:30%">คำสั่ง</th><th>ความหมาย</th></tr>
    <tr><td><code>start nginx</code></td><td>เริ่มทำงานแบบ background</td></tr>
    <tr><td><code>nginx -s stop</code></td><td>หยุดทันที</td></tr>
    <tr><td><code>nginx -s reload</code></td><td>โหลด config ใหม่โดยไม่หยุดบริการ</td></tr>
    <tr><td><code>nginx -t</code></td><td>ตรวจไวยากรณ์ config ก่อนใช้จริง</td></tr>
  </table>
  ${note('tip', 'พอร์ต 80 ชนกับโปรแกรมอื่น', 'ถ้า <code>start nginx</code> แล้วเปิด localhost ไม่ขึ้น ให้ดูใน <code>&lt;nginx&gt;/logs/error.log</code> ส่วนใหญ่เกิดจากมีโปรแกรมอื่นจองพอร์ต 80 อยู่ แก้โดยเปลี่ยน <code>listen 80;</code> เป็นพอร์ตอื่น เช่น <code>8080</code> แล้วเพิ่ม origin นั้นใน CORS ด้วย')}
</section>


<section>
  <h2><span class="no">15</span>Lab 13: เอกสาร API ด้วย Swagger</h2>
  <p>Swagger UI อ่านไฟล์ OpenAPI (เขียนด้วย YAML) แล้วสร้างหน้าเอกสาร API ที่กดทดลองยิง request ได้ทันที
     เปิดดูได้ที่ <b>http://localhost:3000/api-docs</b></p>

  <h3>ติดตั้ง</h3>
  ${code('Terminal', `npm install swagger-ui-express yaml`, 'bash')}

  <h3>ผูกเข้ากับ Express</h3>
  <p>ใส่ไว้ <b>หลัง</b> การผูก route ทั้งหมดใน <code>server/index.js</code></p>
  ${code('server/index.js', serverIndex.slice(serverIndex.indexOf('// API document'), serverIndex.indexOf('app.listen')).trimEnd(), 'js')}
  ${note('tip', 'ทำไมต้องใช้ path.dirname(fileURLToPath(import.meta.url))', 'เอกสารแลปอ่านไฟล์ด้วย path ตรง ๆ (<code>services/swagger.yaml</code>) ซึ่งอิงกับโฟลเดอร์ที่สั่งรัน ถ้ารันจากที่อื่นจะหาไฟล์ไม่เจอ ในโปรเจกต์นี้อ้างอิงจากตำแหน่งของ <code>server/index.js</code> เอง จึงรันจากที่ไหนก็ได้')}

  <h3>โครงของไฟล์ YAML</h3>
  <ul>
    <li><b>Comment</b> ขึ้นต้นด้วย <code>#</code></li>
    <li><b>Key-value</b> คั่นด้วย <code>:</code> และหนึ่งช่องว่าง</li>
    <li><b>Indentation</b> ใช้ช่องว่าง (ห้าม tab) การเยื้องบอกว่าอะไรเป็นลูกของอะไร เหมือน Python</li>
    <li><b>List</b> ขึ้นต้นแต่ละรายการด้วย <code>-</code></li>
    <li><b>|</b> หลัง key แปลว่าค่าถัดไปเป็นข้อความหลายบรรทัด</li>
  </ul>
  ${code('server/swagger.yaml — ส่วนหัวและ server', swaggerYamlPart('openapi: 3.0.4', 'tags:'), 'yaml')}

  <h3>GET: อธิบาย endpoint และ response</h3>
  ${code('server/swagger.yaml — GET /products', swaggerYamlPart('  /products:', '  /products/three:'), 'yaml')}
  <p><code>$ref</code> คือการอ้างอิงไปที่ schema ที่ประกาศไว้ใน <code>components</code> จะได้ไม่ต้องเขียนรายละเอียดซ้ำทุกที่</p>

  <h3>GET + Parameters</h3>
  <p>endpoint ที่มีตัวแปรใน path เขียนชื่อไว้ในวงเล็บปีกกา แล้วประกาศไว้ใต้ <code>parameters</code></p>
  ${code('server/swagger.yaml — GET /products/{id}', swaggerYamlPart('  /products/{id}:', '    put:'), 'yaml')}

  <h3>POST ผ่าน Body</h3>
  <p>endpoint เดียวกันแต่คนละ method ให้เขียนไว้ใต้ path เดียวกัน แยกกันที่ชื่อ method</p>
  ${code('server/swagger.yaml — POST /products และ schema ที่ใช้', [swaggerYamlPart('    post:', '  /products/three:'), '', swaggerYamlPart('    new_product:', '    register_member:')].join('\n'), 'yaml')}

  <h3>บอกว่า endpoint ไหนต้องล็อกอิน</h3>
  <p>ประกาศวิธียืนยันตัวตนไว้ที่ <code>components.securitySchemes</code> แล้วใส่ <code>security</code> ให้ endpoint ที่ต้องใช้
     Swagger UI จะขึ้นรูปกุญแจที่ endpoint นั้น</p>
  ${code('server/swagger.yaml — cookie auth', swaggerYamlPart('  securitySchemes:', '  parameters:'), 'yaml')}
  ${note('warn', 'ทดลองยิงจากหน้า Swagger', 'cookie เป็น httpOnly + SameSite=Strict ปุ่ม Try it out จะใช้ได้ก็ต่อเมื่อ login ผ่านหน้าเว็บในเบราว์เซอร์เดียวกันมาก่อน เพราะ Swagger UI ยิงจาก origin <code>localhost:3000</code> ซึ่งเบราว์เซอร์จะแนบ cookie ให้เอง ส่วน endpoint ที่ต้องเป็นแอดมินก็ต้องล็อกอินด้วยบัญชีแอดมิน')}

  <h3>สิ่งที่เอกสารนี้ครอบคลุม</h3>
  <table>
    <tr><th style="width:22%">กลุ่ม</th><th style="width:14%">จำนวน</th><th>ตัวอย่าง endpoint</th></tr>
    <tr><td>Products</td><td>9</td><td><code>GET /products</code>, <code>POST /products</code>, <code>DELETE /products/{id}</code></td></tr>
    <tr><td>Members</td><td>8</td><td><code>POST /members/login</code>, <code>POST /members/uploadimg</code></td></tr>
    <tr><td>Carts</td><td>11</td><td><code>POST /carts/addcartdtl</code>, <code>PUT /carts/cfcart/{id}</code></td></tr>
    <tr><td>Database</td><td>5</td><td><code>GET /database/overview</code>, <code>PUT /database/members/{memEmail}/role</code></td></tr>
  </table>
  ${note('tip', 'เอกสารต้องตรงกับโค้ดเสมอ', 'ทุก route ที่ Express ผูกไว้ถูกเขียนไว้ในไฟล์ YAML ครบทั้ง 33 รายการ เวลาเพิ่ม route ใหม่ให้เพิ่มใน <code>server/swagger.yaml</code> ด้วย ไม่งั้นเอกสารจะบอกไม่ตรงกับของจริง')}
</section>

<section>
  <h2><span class="no">16</span>ส่วนที่ทำเพิ่มนอกแลป</h2>
  <p>ส่วนเหล่านี้ไม่มีในเอกสารแลป แต่อยู่ในโปรเจกต์แล้ว</p>
  <table>
    <tr><th style="width:26%">เรื่อง</th><th>รายละเอียด</th></tr>
    <tr><td>ฟิลเตอร์ทุกหน้า</td><td>หน้าสินค้า (แบรนด์ ประเภท ช่วงราคา การเรียง) หน้าจัดการสินค้า (คำค้น แบรนด์ ประเภท ช่วงราคา) ประวัติคำสั่งซื้อ (รหัสตะกร้า สถานะ ช่วงวันที่ ช่วงยอดเงิน จำนวน) ตะกร้า (คำค้น การเรียง) และหน้าฐานข้อมูล (กรองชื่อตาราง ค้นหาในแถว เลือกคอลัมน์) ทั้งหมดกรองฝั่งเบราว์เซอร์จากข้อมูลที่โหลดมาแล้ว ไม่ยิง API เพิ่ม</td></tr>
    <tr><td>ตัวเลือกแบบ custom</td><td><code>src/components/ui/SkySelect.vue</code> แทน <code>&lt;select&gt;</code> ทุกจุด รองรับคีย์บอร์ดครบ และ <code>SkyRange.vue</code> สำหรับช่วงราคา / ยอดเงิน เลือกจากช่วงสำเร็จรูปหรือกรอกเองก็ได้</td></tr>
    <tr><td>ลบข้อมูลได้ทุกส่วน</td><td>สินค้า (<code>DELETE /products/:id</code> ลบไฟล์รูปตามไปด้วย) แถวของ products / brands / pdTypes ในหน้าฐานข้อมูล (<code>DELETE /database/rows/:table/:id</code> เฉพาะ admin และชื่อตารางมาจาก whitelist ในโค้ด) สมาชิก ตะกร้า สินค้าในตะกร้า และรูปโปรไฟล์</td></tr>
    <tr><td>สองภาษา</td><td>ทุกข้อความอยู่ใน <code>src/i18n.js</code> ทั้ง en และ th รวมถึงข้อความที่ API ส่งกลับมา (API ส่งเป็นคีย์ เช่น <code>photo.uploaded</code> แล้วหน้าเว็บแปลเอง)</td></tr>
  </table>
</section>

<section>
  <h2><span class="no">17</span>สิ่งที่ต่างจากเอกสารแลป</h2>
  <table>
    <tr><th style="width:34%">เอกสารแลป</th><th style="width:33%">โปรเจกต์นี้</th><th>เหตุผล</th></tr>
    <tr><td><code>bcrypt</code></td><td><code>bcryptjs</code></td><td>มีในโปรเจกต์แล้ว API เหมือนกัน ไม่ต้องคอมไพล์บน Windows</td></tr>
    <tr><td>ไฟล์ <code>index.js</code>, <code>routes/</code>, <code>services/database.js</code></td><td><code>server/index.js</code>, <code>server/routes/</code>, <code>server/database.js</code></td><td>แยก backend ทั้งหมดไว้ในโฟลเดอร์ <code>server/</code></td></tr>
    <tr><td>ตัวแปร <code>DBSERVER</code>, <code>DBUSER</code>, …</td><td><code>DB_HOST</code>, <code>DB_USER</code>, …</td><td>ชื่อที่ <code>database.js</code> ใช้อยู่</td></tr>
    <tr><td><code>postMember</code> ส่ง <code>bodyData</code> กลับทั้งก้อน</td><td>ส่งกลับแค่อีเมล ชื่อ วันที่ และผล</td><td>ไม่ให้รหัสผ่านถูกส่งกลับไปใน response</td></tr>
    <tr><td><code>SECRET_KEY='thailandgogo'</code></td><td>ค่าสุ่ม 64 ตัวอักษร และ server ไม่ยอมเปิดถ้าไม่มี</td><td>เดา key ไม่ได้ = ปลอม token ไม่ได้</td></tr>
    <tr><td>แต่ละหน้าเรียก <code>/members/detail</code> เอง และ MainMenu ใช้ <code>watch</code></td><td><code>authStore.getMember()</code> ที่เดียว + router guard</td><td>ทุกหน้าเห็นข้อมูลชุดเดียวกัน ไม่ยิง API ซ้ำ</td></tr>
    <tr><td>ตะกร้าส่ง <code>memEmail</code> / <code>cusId</code> มาใน body</td><td>อ่านจาก token ใน cookie</td><td>ค่าใน body ปลอมเป็นคนอื่นได้ทั้งการดูและการแก้ตะกร้า</td></tr>
    <tr><td><code>postCartDtl</code> รับราคาจาก <code>req.body.pdPrice</code></td><td>อ่านราคาจากตาราง <code>products</code></td><td>ถ้าเชื่อราคาจากหน้าเว็บ ผู้ใช้แก้เป็น 0.01 บาทแล้วสั่งซื้อได้</td></tr>
    <tr><td>ไม่ได้ตรวจสถานะตะกร้าตอนแก้ไข</td><td>ตะกร้าที่ยืนยันแล้วแก้ไม่ได้ (<code>canEditCart</code>)</td><td>คำสั่งซื้อที่ยืนยันแล้วไม่ควรเปลี่ยนยอดได้อีก</td></tr>
    <tr><td>ปุ่มลบตะกร้า / ยืนยันสั่งสินค้า มีแต่ <code>confirm()</code></td><td>ต่อกับ <code>delCart</code> และ <code>cfCart</code> จริง</td><td>ให้ปุ่มทำงานได้จริง</td></tr>
    <tr><td>ตะกร้าเก็บใน localStorage (ของเดิมในโปรเจกต์)</td><td>เก็บในฐานข้อมูลตาม Lab 11</td><td>ตะกร้าผูกกับสมาชิก ใช้ข้ามเครื่องได้ และมีประวัติคำสั่งซื้อ</td></tr>
    <tr><td>ฟอร์ม Bootstrap ตามแลป</td><td>ดีไซน์ใหม่ + สลับภาษา ไทย/อังกฤษ</td><td>ส่วนที่ออกแบบเพิ่มในโปรเจกต์ (ถอด Bootstrap ออกแล้ว)</td></tr>
    <tr><td>Lab 12: ชื่อไฟล์รูปจาก <code>req.body.memEmail</code></td><td>ชื่อไฟล์จาก token และกรองตัวอักษรก่อนใช้</td><td>กันการทับรูปคนอื่นและการเขียนไฟล์นอกโฟลเดอร์</td></tr>
    <tr><td>Lab 13: อ่าน <code>services/swagger.yaml</code> ด้วย path ตรง ๆ และอธิบายเฉพาะ <code>/products</code></td><td>อ่านไฟล์จากตำแหน่งของ <code>server/index.js</code> และอธิบายครบทั้ง 33 endpoint</td><td>รันจากโฟลเดอร์ไหนก็หาไฟล์เจอ และเอกสารตรงกับ API จริงทั้งหมด</td></tr>
    <tr><td>Lab 12: บันทึกเป็น <code>.jpg</code> เสมอ และเดาว่ามีรูปไหมด้วย <code>new Image()</code></td><td>เก็บนามสกุลจริง และ <code>GET /members/detail</code> บอก path ของรูปมาเลย</td><td>ไฟล์ png ไม่ถูกตั้งชื่อผิดชนิด และหน้าเว็บไม่ต้องเดา</td></tr>
  </table>
</section>

</body>
</html>`

fs.mkdirSync(OUT_DIR, { recursive: true })
const htmlPath = path.join(OUT_DIR, '.guide.tmp.html')
fs.writeFileSync(htmlPath, html)

const browser = await chromium.launch({ executablePath: CHROME })
const page = await browser.newPage()
await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const outPath = path.join(OUT_DIR, 'Lab09-13-Guide.pdf')
await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;padding:0 16mm;font:8pt sans-serif;color:#64748b;display:flex;justify-content:space-between"><span>KUSHOP · Lab 09–13 Guide</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' }
})
await browser.close()
fs.unlinkSync(htmlPath)
console.log('written', outPath, fs.statSync(outPath).size, 'bytes')
