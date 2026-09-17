import { ref, watchEffect } from 'vue'

const messages = {
    en: {
        'nav.home': 'Home',
        'nav.products': 'Products',
        'nav.login': 'Sign in',
        'nav.manage': 'Manage',
        'nav.editData': 'Edit data',
        'nav.database': 'Database',
        'nav.cart': 'Cart',
        'nav.cartAria': 'Cart, {n} items',
        'nav.menu': 'Main menu',
        'nav.homeAria': 'KUSHOP home',

        'theme.label': 'Theme',
        'theme.classic': 'Classic',
        'theme.sky': 'Bright',
        'lang.label': 'Language',

        'store.name': 'Kasetsart University Sriracha store',
        'common.retry': 'Try again',
        'common.loadFail': "Couldn't load products",
        'common.loadFailText': "We couldn't reach the data server. Please try again.",
        'common.items': '{n} items',

        'home.titleA': 'Everyday gear',
        'home.titleB': 'made for',
        'home.lead': 'Browse, add to cart and check out in just a few steps.',
        'home.browse': 'Browse products',
        'home.cart': 'Cart ({n})',
        'home.p1': 'Free shipping on every order',
        'home.p1Text': 'No extra delivery fees',
        'home.p2': 'Instant search',
        'home.p2Text': 'Type a name and find it fast',
        'home.p3': 'Your cart remembers',
        'home.p3Text': 'Close the tab, your items stay put',
        'home.featuredKicker': 'Picked for today',
        'home.featured': 'Featured products',
        'home.seeAll': 'See all products',
        'home.empty': 'No featured products yet',
        'home.emptyText': 'Take a look at everything in the store.',
        'home.goProducts': 'Go to products',
        'home.classicWelcome': 'Welcome to the Kasetsart University Sriracha store',

        'product.noBrand': 'No brand',
        'product.add': 'Add to cart',
        'product.added': 'In your cart',
        'product.addedLive': 'Added {name} to your cart',
        'product.imgAlt': 'Product image',

        'shop.kicker': 'All products',
        'shop.title': 'Our products',
        'shop.lead': 'Type a product name, then search.',
        'shop.searchLabel': 'Search products',
        'shop.placeholder': 'e.g. shirt, cap',
        'shop.search': 'Search',
        'shop.resultsFor': 'Results for “{q}” ·',
        'shop.found': 'Found',
        'shop.items': 'items',
        'shop.clear': 'Clear search',
        'shop.noMatch': 'No products match “{q}”',
        'shop.noMatchText': 'Try a shorter word, or browse everything first.',
        'shop.showAll': 'Show all products',

        'cart.kicker': 'YOUR SELECTION',
        'cart.title': 'Your cart',
        'cart.lead': 'Review your items before checkout',
        'cart.decrease': 'Decrease quantity of {name}',
        'cart.increase': 'Increase quantity of {name}',
        'cart.remove': 'Remove {name} from cart',
        'cart.checkoutKicker': 'CHECKOUT',
        'cart.summary': 'Order summary',
        'cart.itemsLine': 'Items ({n})',
        'cart.shipping': 'Shipping',
        'cart.free': 'Free',
        'cart.total': 'Total',
        'cart.name': 'Recipient name',
        'cart.namePh': 'Full name',
        'cart.phone': 'Phone number',
        'cart.address': 'Shipping address',
        'cart.addressPh': 'Where should we deliver?',
        'cart.confirm': 'Place order',
        'cart.done': 'Order received. Thank you for shopping at KUSHOP!',
        'cart.redirect': 'Taking you back to the home page…',
        'cart.empty': 'Your cart is empty',
        'cart.emptyText': 'Pick something you like, then come back here to check out.',
        'cart.browse': 'Browse products →',

        'auth.kicker': 'KUSHOP MEMBERS',
        'auth.welcome': 'Welcome',
        'auth.back': 'back',
        'auth.intro': 'Manage your account and shop the KU Shop, all in one place.',
        'auth.loginTitle': 'Sign in',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.submitLogin': 'Sign in',
        'auth.loginFail': 'Sign-in failed',
        'auth.bypass': 'Skip sign-in (test mode)',
        'auth.toRegister': 'New here? Create an account',

        'register.heading': 'Join',
        'register.highlight': 'KUSHOP',
        'register.title': 'Create an account',
        'register.name': 'Your name',
        'register.submit': 'Sign up',
        'register.toLogin': 'Already a member? Sign in',
        'register.fail': 'Sign-up failed',

        'member.duty': 'Role',
        'member.signedIn': 'Signed in',

        'profile.kicker': 'KUSHOP MEMBER',
        'profile.status': 'Status',
        'profile.edit': 'Edit profile',
        'profile.currentPassword': 'Current password',
        'profile.newPassword': 'New password',
        'profile.confirmPassword': 'Confirm new password',
        'profile.save': 'Save changes',
        'profile.saving': 'Saving…',
        'profile.cancel': 'Cancel',
        'profile.saved': 'Profile updated successfully.',
        'profile.nameRequired': 'Please enter your name.',
        'profile.nameTooLong': 'Your name must be 100 characters or fewer.',
        'profile.passwordFieldsRequired': 'Fill in all password fields to change your password.',
        'profile.passwordTooShort': 'The new password must be at least 6 characters.',
        'profile.passwordMismatch': 'The new passwords do not match.',
        'profile.currentPasswordWrong': 'The current password is incorrect.',
        'profile.notAuthenticated': 'Your session has expired. Please sign in again.',
        'profile.notFound': 'Member account not found.',
        'profile.updateFail': 'Could not update your profile.',
        'profile.logout': 'Sign out',

        'manage.kicker': 'PRODUCT MANAGEMENT',
        'manage.title': 'Edit products',
        'manage.lead': 'Add a new product, or pick one from the list to edit it.',
        'manage.new': '+ New product',
        'manage.editing': 'Edit product',
        'manage.adding': 'Add a new product',
        'manage.idLabel': 'Product ID {id}',
        'manage.fillAll': 'Fill in every field',
        'manage.name': 'Product name',
        'manage.namePh': 'e.g. KUSRC T-shirt',
        'manage.price': 'Price',
        'manage.brandId': 'Brand ID',
        'manage.brandName': 'Brand name',
        'manage.typeId': 'Product type ID',
        'manage.detail': 'Description',
        'manage.detailPh': 'Extra details',
        'manage.image': 'Product image',
        'manage.imageHint': 'JPG, PNG or WebP, up to 5 MB',
        'manage.saveEdit': 'Save changes',
        'manage.add': 'Add product',
        'manage.clear': 'Clear form',
        'manage.list': 'Product list',
        'manage.edit': 'Edit',
        'manage.empty': 'No products yet',
        'manage.updated': 'Product updated',
        'manage.added': 'Product added',
        'manage.saveFail': "Couldn't save the product",
        'manage.loadFail': "Couldn't load products",

        'db.kicker': 'SYSTEM DATABASE',
        'db.title': 'Everything in the system',
        'db.lead': 'See the tables, columns and rows the system is using.',
        'db.note': 'Passwords are shown as a status only, for security.',
        'db.refresh': 'Refresh',
        'db.loading': 'Loading data…',
        'db.table': 'TABLE',
        'db.actions': 'Actions',
        'db.delete': 'Delete',
        'db.confirmDelete': 'Delete member {email}?',
        'db.memberEmailRequired': 'Member email is required.',
        'db.memberNotFound': 'Member not found.',
        'db.deleteMemberFail': 'Could not delete member.',
        'db.empty': 'This table has no data yet',
        'db.noTables': 'No tables found',
        'db.loadFail': "Couldn't load the database overview"
    },
    th: {
        'nav.home': 'หน้าหลัก',
        'nav.products': 'สินค้า',
        'nav.login': 'เข้าสู่ระบบ',
        'nav.manage': 'จัดการสินค้า',
        'nav.editData': 'แก้ไขข้อมูล',
        'nav.database': 'ฐานข้อมูล',
        'nav.cart': 'ตะกร้า',
        'nav.cartAria': 'ตะกร้า {n} ชิ้น',
        'nav.menu': 'เมนูหลัก',
        'nav.homeAria': 'KUSHOP หน้าหลัก',

        'theme.label': 'เลือกธีม',
        'theme.classic': 'คลาสสิก',
        'theme.sky': 'สดใส',
        'lang.label': 'ภาษา',

        'store.name': 'ร้านค้าประจำ ม.เกษตรศาสตร์ ศรีราชา',
        'common.retry': 'ลองอีกครั้ง',
        'common.loadFail': 'ยังโหลดสินค้าไม่ได้',
        'common.loadFailText': 'ระบบเชื่อมต่อข้อมูลไม่สำเร็จ ลองใหม่อีกครั้งนะ',
        'common.items': '{n} รายการ',

        'home.titleA': 'ของใช้ที่ใช่',
        'home.titleB': 'สำหรับชาว',
        'home.lead': 'เลือกดูสินค้า ใส่ตะกร้า แล้วสั่งซื้อได้ในไม่กี่ขั้นตอน',
        'home.browse': 'เลือกชมสินค้า',
        'home.cart': 'ตะกร้า ({n})',
        'home.p1': 'ส่งฟรีทุกคำสั่งซื้อ',
        'home.p1Text': 'ไม่มีค่าจัดส่งเพิ่ม',
        'home.p2': 'ค้นหาได้ทันที',
        'home.p2Text': 'พิมพ์ชื่อสินค้าแล้วเจอเลย',
        'home.p3': 'ตะกร้าจำไว้ให้',
        'home.p3Text': 'ปิดหน้าไปแล้วของยังอยู่ครบ',
        'home.featuredKicker': 'แนะนำวันนี้',
        'home.featured': 'สินค้าแนะนำ',
        'home.seeAll': 'ดูสินค้าทั้งหมด',
        'home.empty': 'ยังไม่มีสินค้าแนะนำ',
        'home.emptyText': 'เข้าไปดูสินค้าทั้งหมดในร้านได้เลย',
        'home.goProducts': 'ไปหน้าสินค้า',
        'home.classicWelcome': 'ยินดีต้อนรับสู่ร้านค้าประจำเกษตรศาสตร์ศรีราชา',

        'product.noBrand': 'ไม่ระบุแบรนด์',
        'product.add': 'เพิ่มลงตะกร้า',
        'product.added': 'อยู่ในตะกร้าแล้ว',
        'product.addedLive': 'เพิ่ม {name} ลงตะกร้าแล้ว',
        'product.imgAlt': 'รูปสินค้า',

        'shop.kicker': 'สินค้าทั้งหมด',
        'shop.title': 'ผลิตภัณฑ์ของเรา',
        'shop.lead': 'พิมพ์ชื่อสินค้าที่ต้องการ แล้วกดค้นหา',
        'shop.searchLabel': 'ค้นหาสินค้า',
        'shop.placeholder': 'เช่น เสื้อ, หมวก',
        'shop.search': 'ค้นหา',
        'shop.resultsFor': 'ผลการค้นหา “{q}” ·',
        'shop.found': 'พบ',
        'shop.items': 'รายการ',
        'shop.clear': 'ล้างการค้นหา',
        'shop.noMatch': 'ไม่พบสินค้าที่ตรงกับ “{q}”',
        'shop.noMatchText': 'ลองใช้คำที่สั้นลง หรือดูสินค้าทั้งหมดก่อนก็ได้',
        'shop.showAll': 'ดูสินค้าทั้งหมด',

        'cart.kicker': 'รายการที่เลือก',
        'cart.title': 'ตะกร้าสินค้า',
        'cart.lead': 'ตรวจสอบรายการก่อนชำระเงิน',
        'cart.decrease': 'ลดจำนวน {name}',
        'cart.increase': 'เพิ่มจำนวน {name}',
        'cart.remove': 'ลบ {name} ออกจากตะกร้า',
        'cart.checkoutKicker': 'ชำระเงิน',
        'cart.summary': 'สรุปคำสั่งซื้อ',
        'cart.itemsLine': 'สินค้า {n} ชิ้น',
        'cart.shipping': 'ค่าจัดส่ง',
        'cart.free': 'ฟรี',
        'cart.total': 'ยอดรวม',
        'cart.name': 'ชื่อผู้รับ',
        'cart.namePh': 'ชื่อ - นามสกุล',
        'cart.phone': 'เบอร์โทรศัพท์',
        'cart.address': 'ที่อยู่จัดส่ง',
        'cart.addressPh': 'ที่อยู่สำหรับจัดส่ง',
        'cart.confirm': 'ยืนยันคำสั่งซื้อ',
        'cart.done': 'รับคำสั่งซื้อเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ KUSHOP',
        'cart.redirect': 'กำลังพากลับไปหน้าหลัก…',
        'cart.empty': 'ยังไม่มีสินค้าในตะกร้า',
        'cart.emptyText': 'เลือกสินค้าที่ชอบ แล้วกลับมาชำระเงินที่นี่',
        'cart.browse': 'เลือกชมสินค้า →',

        'auth.kicker': 'สมาชิก KUSHOP',
        'auth.welcome': 'ยินดีต้อนรับ',
        'auth.back': 'กลับมา',
        'auth.intro': 'จัดการบัญชีสมาชิกและเลือกซื้อสินค้าจากร้าน KU Shop ได้ในที่เดียว',
        'auth.loginTitle': 'เข้าสู่ระบบ',
        'auth.email': 'อีเมล',
        'auth.password': 'รหัสผ่าน',
        'auth.submitLogin': 'เข้าสู่ระบบ',
        'auth.loginFail': 'เข้าสู่ระบบไม่สำเร็จ',
        'auth.bypass': 'ข้ามการเข้าสู่ระบบ (โหมดทดสอบ)',
        'auth.toRegister': 'ยังไม่มีบัญชี? ลงทะเบียนใหม่',

        'register.heading': 'ลงทะเบียน',
        'register.highlight': 'สมาชิกใหม่',
        'register.title': 'ลงทะเบียนสมาชิกใหม่',
        'register.name': 'ชื่อ',
        'register.submit': 'ตกลง',
        'register.toLogin': 'เป็นสมาชิกอยู่แล้ว? เข้าสู่ระบบ',
        'register.fail': 'ลงทะเบียนผิดพลาด',

        'member.duty': 'สิทธิ์การใช้งาน',
        'member.signedIn': 'เข้าสู่ระบบอยู่',

        'profile.kicker': 'สมาชิก KUSHOP',
        'profile.status': 'สถานะ',
        'profile.edit': 'แก้ไขโปรไฟล์',
        'profile.currentPassword': 'รหัสผ่านเดิม',
        'profile.newPassword': 'รหัสผ่านใหม่',
        'profile.confirmPassword': 'ยืนยันรหัสผ่านใหม่',
        'profile.save': 'บันทึกการเปลี่ยนแปลง',
        'profile.saving': 'กำลังบันทึก…',
        'profile.cancel': 'ยกเลิก',
        'profile.saved': 'อัปเดตโปรไฟล์เรียบร้อยแล้ว',
        'profile.nameRequired': 'กรุณากรอกชื่อ',
        'profile.nameTooLong': 'ชื่อต้องมีความยาวไม่เกิน 100 ตัวอักษร',
        'profile.passwordFieldsRequired': 'กรุณากรอกข้อมูลรหัสผ่านให้ครบทุกช่อง',
        'profile.passwordTooShort': 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร',
        'profile.passwordMismatch': 'รหัสผ่านใหม่ไม่ตรงกัน',
        'profile.currentPasswordWrong': 'รหัสผ่านเดิมไม่ถูกต้อง',
        'profile.notAuthenticated': 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
        'profile.notFound': 'ไม่พบบัญชีสมาชิก',
        'profile.updateFail': 'ไม่สามารถอัปเดตโปรไฟล์ได้',
        'profile.logout': 'ออกจากระบบ',

        'manage.kicker': 'จัดการสินค้า',
        'manage.title': 'แก้ไขข้อมูลสินค้า',
        'manage.lead': 'เพิ่มสินค้าใหม่ หรือเลือกสินค้าจากรายการเพื่อแก้ไขข้อมูล',
        'manage.new': '+ สินค้าใหม่',
        'manage.editing': 'แก้ไขสินค้า',
        'manage.adding': 'เพิ่มสินค้าใหม่',
        'manage.idLabel': 'รหัสสินค้า {id}',
        'manage.fillAll': 'กรอกข้อมูลให้ครบถ้วน',
        'manage.name': 'ชื่อสินค้า',
        'manage.namePh': 'เช่น เสื้อ KUSRC',
        'manage.price': 'ราคา',
        'manage.brandId': 'รหัสแบรนด์',
        'manage.brandName': 'ชื่อแบรนด์',
        'manage.typeId': 'รหัสประเภทสินค้า',
        'manage.detail': 'รายละเอียดสินค้า',
        'manage.detailPh': 'รายละเอียดเพิ่มเติม',
        'manage.image': 'รูปสินค้า',
        'manage.imageHint': 'JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB',
        'manage.saveEdit': 'บันทึกการแก้ไข',
        'manage.add': 'เพิ่มสินค้า',
        'manage.clear': 'ล้างฟอร์ม',
        'manage.list': 'รายการสินค้า',
        'manage.edit': 'แก้ไข',
        'manage.empty': 'ยังไม่มีข้อมูลสินค้า',
        'manage.updated': 'แก้ไขข้อมูลเรียบร้อยแล้ว',
        'manage.added': 'เพิ่มสินค้าเรียบร้อยแล้ว',
        'manage.saveFail': 'ไม่สามารถบันทึกข้อมูลได้',
        'manage.loadFail': 'ไม่สามารถโหลดข้อมูลสินค้าได้',

        'db.kicker': 'ฐานข้อมูลระบบ',
        'db.title': 'ข้อมูลทั้งหมดในระบบ',
        'db.lead': 'ดูตาราง คอลัมน์ และรายการข้อมูลที่ระบบกำลังใช้งาน',
        'db.note': 'รหัสผ่านจะแสดงเป็นสถานะเท่านั้น เพื่อความปลอดภัย',
        'db.refresh': 'รีเฟรชข้อมูล',
        'db.loading': 'กำลังโหลดข้อมูล…',
        'db.table': 'ตาราง',
        'db.actions': 'การจัดการ',
        'db.delete': 'ลบ',
        'db.confirmDelete': 'ต้องการลบสมาชิก {email} หรือไม่?',
        'db.memberEmailRequired': 'กรุณาระบุอีเมลสมาชิก',
        'db.memberNotFound': 'ไม่พบสมาชิก',
        'db.deleteMemberFail': 'ไม่สามารถลบสมาชิกได้',
        'db.empty': 'ยังไม่มีข้อมูลในตารางนี้',
        'db.noTables': 'ไม่พบตารางข้อมูลที่ระบบกำหนดไว้',
        'db.loadFail': 'ไม่สามารถโหลดข้อมูลฐานข้อมูลได้'
    }
}

// The API replies in a fixed language; map its messages into the other one.
const serverMessages = {
    en: {
        'ไม่สามารถโหลดข้อมูลฐานข้อมูลได้': "Couldn't load the database overview",
        'Login Fail': 'Incorrect email or password',
        'Server error': "Couldn't reach the server. Please try again.",
        'Login and Password is required': 'Please enter your email and password',
        'Regist Success': 'Account created. You can sign in now.',
        'ERROR memEmail, memName and password are required.': 'Please fill in email, name and password'
    },
    th: {
        'Login Success': 'เข้าระบบสำเร็จ',
        'Login Fail': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        'Server error': 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ ลองใหม่อีกครั้ง',
        'Login and Password is required': 'กรุณากรอกอีเมลและรหัสผ่าน',
        'Regist Success': 'ลงทะเบียนสำเร็จ เข้าสู่ระบบได้เลย',
        'ERROR memEmail, memName and password are required.': 'กรุณากรอกอีเมล ชื่อ และรหัสผ่าน'
    }
}
const serverPatterns = {
    en: [[/^ERROR memEmail (.+) is exists.$/, 'The email $1 is already registered']],
    th: [[/^ERROR memEmail (.+) is exists.$/, 'อีเมล $1 ถูกใช้ลงทะเบียนแล้ว']]
}

const translateServer = (text) => {
    const direct = serverMessages[locale.value][text]
    if (direct) return direct
    const match = serverPatterns[locale.value].find(([pattern]) => pattern.test(text))
    return match ? text.replace(match[0], match[1]) : undefined
}

const readSaved = () => {
    try {
        return localStorage.getItem('kushopLang')
    } catch {
        return null
    }
}

export const locale = ref(readSaved() === 'th' ? 'th' : 'en')

watchEffect(() => {
    document.documentElement.lang = locale.value
    try {
        localStorage.setItem('kushopLang', locale.value)
    } catch {
        // ponytail: storage blocked, language still works for this visit
    }
})

export const setLocale = (next) => {
    locale.value = next
}

// Accepts a message key or a raw API message; unknown text is shown as-is.
export const t = (key, params = {}) => {
    const text = messages[locale.value][key]
        ?? translateServer(key)
        ?? key
    return text.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? '')
}
