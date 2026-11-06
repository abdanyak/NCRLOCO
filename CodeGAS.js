/**
 * ============================================================================
 * BACKEND SISTEM MONITORING & INDEKS HISTORY NCR (VERSI AUDIT & GDRIVE SYNC)
 * File: CodeGAS.js (Password Hashing SHA-256, Re-Open Audit Trail, Drive Opt,
 *       Idempotency Anti-Duplicate, & Auto-Reopen on Deleted GDrive Photos)
 * ============================================================================
 */

const DRIVE_ROOT_FOLDER_ID = "12bWz-JBM9f11lQe4-ak_MugDMCylUzbe";
const DEFAULT_ROOT_FOLDER_NAME = "QC_NCR_STORAGE";

const SHEETS = {
    NCR: "Master_NCR",
    FOLLOWUP: "Verifikasi_Unit",
    PRODUCTS: "Master_Produk",
    USERS: "Master_Users"
};

const MASTER_NCR_HEADERS = [
    "ID_NCR",
    "No_NCR",
    "Tanggal",
    "Area_Komponen_Part",
    "Deskripsi_Ketidaksesuaian",
    "Jumlah_Unit",
    "Daftar_Unit_Target",
    "Tanggal_ISO",
    "Platform",
    "Title",
    "Link_File_GDrive_NCR",
    "Nama_File_NCR",
    "Daftar_Foto_Master_JSON"
];

const MASTER_NCR_WIDTHS = [110, 140, 110, 200, 320, 100, 280, 110, 160, 200, 220, 160, 260];

const FOLLOWUP_HEADERS = [
    "Key_ID",
    "Nama_Produk_Unit",
    "ID_NCR",
    "No_NCR",
    "Status",
    "Catatan_Inspector",
    "Inspector_PIC",
    "Waktu_Verifikasi",
    "Jumlah_Foto",
    "Link_Folder_GDrive",
    "Daftar_URL_Foto_JSON",
    "Riwayat_Audit_JSON",
    "Reopen_Oleh",
    "Waktu_Reopen",
    "Alasan_Reopen"
];

const FOLLOWUP_WIDTHS = [180, 170, 100, 130, 100, 260, 120, 150, 100, 220, 300, 320, 130, 150, 240];

function setupDatabase() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const shNcr = getOrCreateSheet_(ss, SHEETS.NCR, MASTER_NCR_HEADERS, MASTER_NCR_WIDTHS);
    ensureSheetHeaders_(shNcr, MASTER_NCR_HEADERS, MASTER_NCR_WIDTHS);

    const shFollow = getOrCreateSheet_(ss, SHEETS.FOLLOWUP, FOLLOWUP_HEADERS, FOLLOWUP_WIDTHS);
    ensureSheetHeaders_(shFollow, FOLLOWUP_HEADERS, FOLLOWUP_WIDTHS);

    getOrCreateSheet_(ss, SHEETS.PRODUCTS, [
        "Nama_Produk_Unit", "Status_Unit", "Waktu_Diperbarui"
    ], [220, 130, 160]);

    const shUsers = getOrCreateSheet_(ss, SHEETS.USERS, [
        "ID_User", "Username", "Password", "Role"
    ], [120, 160, 220, 120]);

    if (shUsers.getLastRow() === 1) {
        const defaultAdminHash = hashUserPassword_("admin", "123");
        shUsers.appendRow([1, "admin", defaultAdminHash, "admin"]);
    }

    const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Lembar1");
    if (defaultSheet && ss.getSheets().length > 1) {
        ss.deleteSheet(defaultSheet);
    }

    getRootDriveFolder_();
}

// ================= KEAMANAN: HASH PASSWORD & TOKEN OTORISASI =================
function hashUserPassword_(username, plainPassword) {
    const strPass = String(plainPassword || "").trim();
    if (strPass.indexOf("sha256$") === 0) return strPass;
    const secretSalt = SpreadsheetApp.getActiveSpreadsheet().getId();
    const raw = "PASS_V1|" + String(username || "").trim().toLowerCase() + "|" + strPass + "|" + secretSalt;
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
    return "sha256$" + Utilities.base64EncodeWebSafe(digest);
}

function generateAuthToken_(username, role, storedPasswordHash) {
    const secretSalt = SpreadsheetApp.getActiveSpreadsheet().getId();
    const rawString = String(username).toLowerCase() + "|" + String(role) + "|" + String(storedPasswordHash) + "|" + secretSalt;
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawString, Utilities.Charset.UTF_8);
    return Utilities.base64EncodeWebSafe(digest);
}

function verifyActor_(ss, payload, requireAdmin) {
    const shUsers = ss.getSheetByName(SHEETS.USERS);
    if (!shUsers || shUsers.getLastRow() <= 1) {
        throw new Error("AUTH_ERROR: Tabel user belum diinisialisasi.");
    }

    const actorUser = String(payload.actorUser || "").trim();
    const actorToken = String(payload.actorToken || "").trim();
    if (!actorUser || !actorToken) {
        throw new Error("AUTH_ERROR: Sesi tidak valid. Silakan login kembali.");
    }

    const rows = shUsers.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
        const dbUser = String(rows[i][1] || "").trim();
        const dbPass = String(rows[i][2] || "").trim();
        const dbRole = String(rows[i][3] || "").trim();

        if (dbUser.toLowerCase() === actorUser.toLowerCase()) {
            const normalizedPassHash = dbPass.indexOf("sha256$") === 0 ? dbPass : hashUserPassword_(dbUser, dbPass);
            const expectedTokenHashed = generateAuthToken_(dbUser, dbRole, normalizedPassHash);
            const expectedTokenLegacy = generateAuthToken_(dbUser, dbRole, dbPass);

            if (actorToken !== expectedTokenHashed && actorToken !== expectedTokenLegacy) {
                throw new Error("AUTH_ERROR: Sesi telah berakhir atau password berubah. Silakan login ulang.");
            }
            if (requireAdmin && dbRole !== "admin") {
                throw new Error("FORBIDDEN: Aksi ini hanya diizinkan untuk Admin QC.");
            }
            return { username: dbUser, role: dbRole };
        }
    }

    throw new Error("AUTH_ERROR: Akun pengguna tidak ditemukan.");
}

// ================= HELPER SHEET & GOOGLE DRIVE =================
function getOrCreateSheet_(ss, sheetName, headers, colWidths) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
    }
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setBackground("#0f172a")
            .setFontColor("#ffffff")
            .setFontWeight("bold")
            .setHorizontalAlignment("center")
            .setVerticalAlignment("middle");
        sheet.setRowHeight(1, 34);
        sheet.setFrozenRows(1);

        colWidths.forEach((w, idx) => {
            sheet.setColumnWidth(idx + 1, w);
        });
    }
    return sheet;
}

function ensureSheetHeaders_(sheet, headers, colWidths) {
    if (!sheet) return;
    if (sheet.getLastRow() === 0) {
        getOrCreateSheet_(SpreadsheetApp.getActiveSpreadsheet(), sheet.getName(), headers, colWidths);
        return;
    }
    const currentLastCol = sheet.getLastColumn();
    if (currentLastCol < headers.length) {
        for (let c = currentLastCol; c < headers.length; c++) {
            const cell = sheet.getRange(1, c + 1);
            cell.setValue(headers[c])
                .setBackground("#0f172a")
                .setFontColor("#ffffff")
                .setFontWeight("bold")
                .setHorizontalAlignment("center")
                .setVerticalAlignment("middle");
            if (colWidths && colWidths[c]) {
                sheet.setColumnWidth(c + 1, colWidths[c]);
            }
        }
    }
}

function parseUnitsCell_(cellValue) {
    if (!cellValue) return [];
    const str = String(cellValue).trim();
    if (!str) return [];
    if (str.charAt(0) === "[") {
        try {
            const parsed = JSON.parse(str);
            if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
        } catch (e) { }
    }
    return str.split(",").map(s => s.trim()).filter(Boolean);
}

function parseJsonArraySafe_(rawStr) {
    if (!rawStr) return [];
    try {
        const parsed = JSON.parse(String(rawStr));
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function getRootDriveFolder_() {
    if (DRIVE_ROOT_FOLDER_ID && DRIVE_ROOT_FOLDER_ID.trim() !== "" && DRIVE_ROOT_FOLDER_ID.indexOf("TEMPEL_ID") === -1) {
        return DriveApp.getFolderById(DRIVE_ROOT_FOLDER_ID.trim());
    }
    const folders = DriveApp.getFoldersByName(DEFAULT_ROOT_FOLDER_NAME);
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder(DEFAULT_ROOT_FOLDER_NAME);
}

function getOrCreateSubFolder_(parentFolder, folderName) {
    const cleanName = String(folderName || "Folder").replace(/[\/\\:*?"<>|]/g, "-").trim();
    const iter = parentFolder.getFoldersByName(cleanName);
    while (iter.hasNext()) {
        const candidate = iter.next();
        if (!candidate.isTrashed()) return candidate;
    }
    return parentFolder.createFolder(cleanName);
}

function saveDocFileToDrive_(folder, base64DataUrl, fileName) {
    if (!base64DataUrl || String(base64DataUrl).indexOf("data:") !== 0) return "";
    const parts = String(base64DataUrl).split(",");
    if (parts.length < 2) return "";
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const bytes = Utilities.base64Decode(parts[1]);
    const blob = Utilities.newBlob(bytes, mimeType, fileName || ("Dokumen_NCR_" + Date.now()));
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
}

function savePhotosArrayToDrive_(folder, base64List, prefixName) {
    const savedPhotoUrls = [];
    const timeStampFile = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
    const list = Array.isArray(base64List) ? base64List : [];

    list.forEach((b64String, idx) => {
        const str = String(b64String || "");
        if (!str) return;
        if (str.indexOf("data:image") === 0) {
            const parts = str.split(",");
            const mimeMatch = parts[0].match(/:(.*?);/);
            const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
            const ext = mimeType.indexOf("png") !== -1 ? "png" : "jpg";
            const fileName = prefixName + "_Foto" + (idx + 1) + "_" + timeStampFile + "." + ext;

            const bytes = Utilities.base64Decode(parts[1]);
            const blob = Utilities.newBlob(bytes, mimeType, fileName);
            const file = folder.createFile(blob);

            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            savedPhotoUrls.push("https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1200");
        } else {
            savedPhotoUrls.push(str);
        }
    });

    return savedPhotoUrls;
}

// ================= VALIDASI KEBERADAAN FILE & FOLDER GOOGLE DRIVE =================
function extractDriveIdFromUrl_(url) {
    if (!url) return "";
    const str = String(url).trim();
    if (!str || str.indexOf("data:") === 0) return "";
    const idParamMatch = str.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
    const pathMatch = str.match(/\/(?:d|folders)\/([a-zA-Z0-9_-]{10,})/);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    return "";
}

function isDriveFolderAlive_(folderUrl, cacheMap) {
    if (!folderUrl) return true;
    const folderId = extractDriveIdFromUrl_(folderUrl);
    if (!folderId) return true;
    const cacheKey = "folder_" + folderId;
    if (cacheMap && cacheMap[cacheKey] !== undefined) return cacheMap[cacheKey];

    let alive = false;
    try {
        const folder = DriveApp.getFolderById(folderId);
        alive = Boolean(folder && !folder.isTrashed());
    } catch (e) {
        alive = false;
    }
    if (cacheMap) cacheMap[cacheKey] = alive;
    return alive;
}

function isDriveFileAlive_(fileUrl, cacheMap) {
    if (!fileUrl) return false;
    const str = String(fileUrl).trim();
    if (!str) return false;
    if (str.indexOf("data:") === 0) return true;

    const fileId = extractDriveIdFromUrl_(str);
    if (!fileId) return true; // URL eksternal non-GDrive dianggap valid

    const cacheKey = "file_" + fileId;
    if (cacheMap && cacheMap[cacheKey] !== undefined) return cacheMap[cacheKey];

    let alive = false;
    try {
        const file = DriveApp.getFileById(fileId);
        alive = Boolean(file && !file.isTrashed());
    } catch (e) {
        alive = false;
    }
    if (cacheMap) cacheMap[cacheKey] = alive;
    return alive;
}

function filterAliveDrivePhotos_(photosArray, folderUrl, cacheMap) {
    const list = Array.isArray(photosArray) ? photosArray : [];
    if (list.length === 0) return [];

    // Jika folder unit di GDrive sudah dihapus/masuk Trash, maka seluruh foto di dalamnya dianggap tidak ada
    if (folderUrl && !isDriveFolderAlive_(folderUrl, cacheMap)) {
        return [];
    }

    return list.filter(function(photoUrl) {
        return isDriveFileAlive_(photoUrl, cacheMap);
    });
}

// ================= ENDPOINT GET & POST =================
function doGet() {
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
        const data = getAllPortalData_();
        return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
        const payload = JSON.parse(e.postData.contents);
        const action = payload.action;
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd MMM yyyy, HH:mm");

        // 0. AUTENTIKASI LOGIN SERVER-SIDE (DENGAN HASH SHA-256 & AUTO-MIGRASI PLAINTEXT)
        if (action === "LOGIN") {
            let shUsers = ss.getSheetByName(SHEETS.USERS);
            if (!shUsers || shUsers.getLastRow() <= 1) {
                setupDatabase();
                shUsers = ss.getSheetByName(SHEETS.USERS);
            }
            const userRows = shUsers.getDataRange().getValues();
            const inputUser = String(payload.username || "").trim();
            const inputPass = String(payload.password || "").trim();

            for (let i = 1; i < userRows.length; i++) {
                const dbId = Number(userRows[i][0]);
                const dbUser = String(userRows[i][1] || "").trim();
                const dbPass = String(userRows[i][2] || "").trim();
                const dbRole = String(userRows[i][3] || "inspector").trim();

                if (dbUser.toLowerCase() === inputUser.toLowerCase()) {
                    const expectedHash = hashUserPassword_(dbUser, inputPass);
                    const isHashedInDb = dbPass.indexOf("sha256$") === 0;
                    const isPasswordValid = isHashedInDb
                        ? (dbPass === expectedHash)
                        : (dbPass === inputPass);

                    if (isPasswordValid) {
                        let finalStoredHash = dbPass;
                        if (!isHashedInDb) {
                            finalStoredHash = expectedHash;
                            shUsers.getRange(i + 1, 3).setValue(finalStoredHash);
                        }

                        const token = generateAuthToken_(dbUser, dbRole, finalStoredHash);
                        const portalData = getAllPortalData_();
                        return ContentService.createTextOutput(JSON.stringify({
                            status: "success",
                            user: {
                                id: dbId,
                                username: dbUser,
                                role: dbRole,
                                token: token
                            },
                            data: portalData
                        })).setMimeType(ContentService.MimeType.JSON);
                    }
                }
            }

            return ContentService.createTextOutput(JSON.stringify({
                status: "error",
                message: "Username atau Password salah!"
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // VALIDASI OTORISASI
        // Catatan: REOPEN_NCR diizinkan untuk non-admin HANYA jika dipicu oleh foto GDrive yang terhapus
        const adminOnlyActions = [
            "ADD_PRODUCT",
            "TOGGLE_PRODUCT_STATUS",
            "DELETE_PRODUCT",
            "ADD_NCR",
            "EDIT_NCR",
            "DELETE_NCR",
            "ADD_USER",
            "DELETE_USER"
        ];
        const isAdminRequired = adminOnlyActions.indexOf(action) !== -1;
        const verifiedActor = verifyActor_(ss, payload, isAdminRequired);

        // 1. TAMBAH UNIT PRODUK (DENGAN CEK ANTI-DUPLIKAT & BATCH UPDATE)
        if (action === "ADD_PRODUCT") {
            const cleanName = String(payload.name || "").replace(/,/g, " ").trim();
            const shProd = ss.getSheetByName(SHEETS.PRODUCTS);
            const existingProds = shProd.getLastRow() > 1
                ? shProd.getRange(2, 1, shProd.getLastRow() - 1, 1).getValues()
                : [];
            const isProdExist = existingProds.some(r => String(r[0]).trim().toLowerCase() === cleanName.toLowerCase());

            if (!isProdExist && cleanName) {
                shProd.appendRow([cleanName, "active", nowStr]);
            }

            if (payload.inherit && !isProdExist && cleanName) {
                const shNcr = ss.getSheetByName(SHEETS.NCR);
                ensureSheetHeaders_(shNcr, MASTER_NCR_HEADERS, MASTER_NCR_WIDTHS);
                const lastRow = shNcr.getLastRow();
                if (lastRow > 1) {
                    const numRows = lastRow - 1;
                    const targetRange = shNcr.getRange(2, 6, numRows, 2);
                    const targetValues = targetRange.getValues();
                    let hasChanged = false;

                    for (let i = 0; i < numRows; i++) {
                        let units = parseUnitsCell_(targetValues[i][1]);
                        const shouldAdd = payload.lastActiveProd
                            ? (units.indexOf(payload.lastActiveProd) !== -1 || units.length === 0)
                            : true;

                        if (shouldAdd && units.indexOf(cleanName) === -1) {
                            units.push(cleanName);
                            targetValues[i][0] = units.length;
                            targetValues[i][1] = units.join(", ");
                            hasChanged = true;
                        }
                    }

                    if (hasChanged) {
                        targetRange.setValues(targetValues);
                    }
                }
            }
        }

        // 2. ARSIPKAN / AKTIFKAN UNIT PRODUK
        else if (action === "TOGGLE_PRODUCT_STATUS") {
            const shProd = ss.getSheetByName(SHEETS.PRODUCTS);
            const rows = shProd.getDataRange().getValues();
            for (let i = 1; i < rows.length; i++) {
                if (String(rows[i][0]) === String(payload.name)) {
                    shProd.getRange(i + 1, 2).setValue(payload.status);
                    shProd.getRange(i + 1, 3).setValue(nowStr);
                    break;
                }
            }
        }

        // 3. HAPUS UNIT PRODUK (BATCH UPDATE TEROPTIMASI)
        else if (action === "DELETE_PRODUCT") {
            const targetUnit = String(payload.name || "").trim();
            if (targetUnit) {
                deleteRowByValue_(ss.getSheetByName(SHEETS.PRODUCTS), 0, targetUnit);
                deleteRowByValue_(ss.getSheetByName(SHEETS.FOLLOWUP), 1, targetUnit);

                const shNcr = ss.getSheetByName(SHEETS.NCR);
                if (shNcr && shNcr.getLastRow() > 1) {
                    const numRows = shNcr.getLastRow() - 1;
                    const targetRange = shNcr.getRange(2, 6, numRows, 2);
                    const targetValues = targetRange.getValues();
                    let hasChanged = false;

                    for (let i = 0; i < numRows; i++) {
                        let units = parseUnitsCell_(targetValues[i][1]);
                        const filtered = units.filter(u => u !== targetUnit);
                        if (filtered.length !== units.length) {
                            targetValues[i][0] = filtered.length;
                            targetValues[i][1] = filtered.join(", ");
                            hasChanged = true;
                        }
                    }

                    if (hasChanged) {
                        targetRange.setValues(targetValues);
                    }
                }
            }
        }

        // 4. TAMBAH MASTER NCR BARU (DENGAN CEK IDEMPOTENSI ANTI-DUPLIKAT)
        else if (action === "ADD_NCR") {
            const shNcr = ss.getSheetByName(SHEETS.NCR);
            ensureSheetHeaders_(shNcr, MASTER_NCR_HEADERS, MASTER_NCR_WIDTHS);

            const existingIds = shNcr.getLastRow() > 1
                ? shNcr.getRange(2, 1, shNcr.getLastRow() - 1, 1).getValues()
                : [];
            const isNcrAlreadySaved = existingIds.some(r => String(r[0]) === String(payload.id));

            if (!isNcrAlreadySaved) {
                const dateDisplay = payload.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd MMM yyyy");
                const rawDate = payload.rawDate || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
                const units = Array.isArray(payload.assignedProducts) ? payload.assignedProducts : [];
                const platform = String(payload.platform || "").trim();
                const title = String(payload.title || "").trim();
                const partCombined = payload.part || (platform && title ? (platform + " — " + title) : (platform || title || "-"));

                let gdriveLink = String(payload.gdriveLink || "").trim();
                const gdriveFileName = String(payload.gdriveFileName || "").trim();
                const incomingPhotos = Array.isArray(payload.masterPhotos) ? payload.masterPhotos : [];
                let savedMasterPhotos = incomingPhotos;

                const hasDocUpload = payload.gdriveFileData && String(payload.gdriveFileData).indexOf("data:") === 0;
                const hasNewBase64Photo = incomingPhotos.some(p => String(p || "").indexOf("data:image") === 0);

                if (hasDocUpload || hasNewBase64Photo) {
                    const rootFolder = getRootDriveFolder_();
                    const masterRoot = getOrCreateSubFolder_(rootFolder, "00_DOKUMEN_MASTER_NCR");
                    const ncrDocFolder = getOrCreateSubFolder_(masterRoot, payload.no || ("NCR_" + payload.id));

                    if (hasDocUpload) {
                        const uploadedUrl = saveDocFileToDrive_(ncrDocFolder, payload.gdriveFileData, gdriveFileName || (payload.no + "_File_NCR"));
                        if (uploadedUrl) gdriveLink = uploadedUrl;
                    }
                    if (hasNewBase64Photo) {
                        savedMasterPhotos = savePhotosArrayToDrive_(ncrDocFolder, incomingPhotos, (payload.no || "NCR") + "_Master");
                    }
                }

                shNcr.appendRow([
                    payload.id,
                    payload.no,
                    dateDisplay,
                    partCombined,
                    payload.desc,
                    units.length,
                    units.join(", "),
                    rawDate,
                    platform,
                    title,
                    gdriveLink,
                    gdriveFileName,
                    JSON.stringify(savedMasterPhotos)
                ]);
            }
        }

        // 5. UBAH MASTER NCR & CAKUPAN UNIT (TERMASUK AKSI LEPAS UNIT)
        else if (action === "EDIT_NCR") {
            const shNcr = ss.getSheetByName(SHEETS.NCR);
            ensureSheetHeaders_(shNcr, MASTER_NCR_HEADERS, MASTER_NCR_WIDTHS);

            const rows = shNcr.getDataRange().getValues();
            const units = Array.isArray(payload.assignedProducts) ? payload.assignedProducts : [];
            const platform = String(payload.platform || "").trim();
            const title = String(payload.title || "").trim();
            const partCombined = payload.part || (platform && title ? (platform + " — " + title) : (platform || title || "-"));

            for (let i = 1; i < rows.length; i++) {
                if (String(rows[i][0]) === String(payload.id)) {
                    const oldUnits = parseUnitsCell_(rows[i][6]);
                    let gdriveLink = payload.gdriveLink !== undefined ? String(payload.gdriveLink).trim() : String(rows[i][10] || "");
                    let gdriveFileName = payload.gdriveFileName !== undefined ? String(payload.gdriveFileName).trim() : String(rows[i][11] || "");

                    if (!gdriveLink && !payload.gdriveFileData) {
                        gdriveFileName = "";
                    }

                    const hasDocUpload = payload.gdriveFileData && String(payload.gdriveFileData).indexOf("data:") === 0;
                    const incomingPhotos = Array.isArray(payload.masterPhotos) ? payload.masterPhotos : parseJsonArraySafe_(rows[i][12]);
                    const hasNewBase64Photo = incomingPhotos.some(p => String(p || "").indexOf("data:image") === 0);

                    let savedMasterPhotos = incomingPhotos;
                    if (hasDocUpload || hasNewBase64Photo) {
                        const rootFolder = getRootDriveFolder_();
                        const masterRoot = getOrCreateSubFolder_(rootFolder, "00_DOKUMEN_MASTER_NCR");
                        const ncrDocFolder = getOrCreateSubFolder_(masterRoot, payload.no || ("NCR_" + payload.id));

                        if (hasDocUpload) {
                            const uploadedUrl = saveDocFileToDrive_(ncrDocFolder, payload.gdriveFileData, gdriveFileName || (payload.no + "_File_NCR"));
                            if (uploadedUrl) gdriveLink = uploadedUrl;
                        }
                        if (hasNewBase64Photo) {
                            savedMasterPhotos = savePhotosArrayToDrive_(ncrDocFolder, incomingPhotos, (payload.no || "NCR") + "_Master");
                        }
                    }

                    const updatedRow = [
                        rows[i][0],
                        payload.no,
                        payload.date || rows[i][2],
                        partCombined,
                        payload.desc,
                        units.length,
                        units.join(", "),
                        payload.rawDate || rows[i][7] || "",
                        platform,
                        title,
                        gdriveLink,
                        gdriveFileName,
                        JSON.stringify(savedMasterPhotos)
                    ];

                    shNcr.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);

                    const shFollow = ss.getSheetByName(SHEETS.FOLLOWUP);
                    oldUnits.forEach(uName => {
                        if (units.indexOf(uName) === -1) {
                            deleteRowByValue_(shFollow, 0, uName + "_" + payload.id);
                        }
                    });
                    break;
                }
            }
        }

        // 6. HAPUS MASTER NCR
        else if (action === "DELETE_NCR") {
            deleteRowByValue_(ss.getSheetByName(SHEETS.NCR), 0, payload.id);
            deleteRowByValue_(ss.getSheetByName(SHEETS.FOLLOWUP), 2, payload.id);
        }

        // 7. UPLOAD BUKTI FOTO INSPECTOR (MEMPERTAHANKAN RIWAYAT AUDIT RE-OPEN)
        else if (action === "UPLOAD_FOLLOWUP") {
            const rootFolder = getRootDriveFolder_();
            const productFolder = getOrCreateSubFolder_(rootFolder, payload.productName);
            const ncrFolder = getOrCreateSubFolder_(productFolder, payload.ncrNo);

            const savedPhotoUrls = savePhotosArrayToDrive_(
                ncrFolder,
                payload.photos || [],
                payload.ncrNo + "_" + payload.productName
            );

            const shFollow = ss.getSheetByName(SHEETS.FOLLOWUP);
            ensureSheetHeaders_(shFollow, FOLLOWUP_HEADERS, FOLLOWUP_WIDTHS);
            const key = payload.productName + "_" + payload.ncrId;

            let existingHistory = [];
            let existingRowIndex = -1;

            if (shFollow.getLastRow() > 1) {
                const followRows = shFollow.getDataRange().getValues();
                for (let i = 1; i < followRows.length; i++) {
                    if (String(followRows[i][0]) === key) {
                        existingRowIndex = i + 1;
                        existingHistory = parseJsonArraySafe_(followRows[i][11]);
                        break;
                    }
                }
            }

            if (existingHistory.length === 0 && Array.isArray(payload.history) && payload.history.length > 0) {
                existingHistory = payload.history;
            }

            const newFollowRow = [
                key,
                payload.productName,
                payload.ncrId,
                payload.ncrNo,
                "CLOSED",
                payload.note,
                verifiedActor.username,
                nowStr,
                savedPhotoUrls.length,
                ncrFolder.getUrl(),
                JSON.stringify(savedPhotoUrls),
                JSON.stringify(existingHistory),
                "",
                "",
                ""
            ];

            if (existingRowIndex !== -1) {
                shFollow.getRange(existingRowIndex, 1, 1, newFollowRow.length).setValues([newFollowRow]);
            } else {
                shFollow.appendRow(newFollowRow);
            }
        }

        // 8. RE-OPEN STATUS NCR UNIT (MANUAL ADMIN ATAU OTOMATIS SAAT FOTO GDRIVE TERHAPUS)
        else if (action === "REOPEN_NCR") {
            const shFollow = ss.getSheetByName(SHEETS.FOLLOWUP);
            ensureSheetHeaders_(shFollow, FOLLOWUP_HEADERS, FOLLOWUP_WIDTHS);
            const key = payload.productName + "_" + payload.ncrId;
            const reopenReason = String(payload.reopenReason || "Perlu verifikasi ulang oleh Inspector").trim();
            const reopenedAt = String(payload.reopenedAt || nowStr).trim();
            const driveCache = {};

            if (shFollow.getLastRow() > 1) {
                const rows = shFollow.getDataRange().getValues();
                for (let i = 1; i < rows.length; i++) {
                    if (String(rows[i][0]) === key) {
                        const prevStatus = String(rows[i][4] || "");
                        const prevNote = String(rows[i][5] || "");
                        const prevInspector = String(rows[i][6] || "");
                        const prevUpdatedAt = String(rows[i][7] || "");
                        const prevFolderUrl = String(rows[i][9] || "");
                        const prevPhotos = parseJsonArraySafe_(rows[i][10]);
                        const alivePhotos = filterAliveDrivePhotos_(prevPhotos, prevFolderUrl, driveCache);
                        const historyList = parseJsonArraySafe_(rows[i][11]);

                        // Jika dipicu oleh non-admin (Inspector), pastikan memang karena foto di GDrive sudah kosong/terhapus
                        if (verifiedActor.role !== "admin" && alivePhotos.length > 0) {
                            throw new Error("FORBIDDEN: Re-Open manual hanya diizinkan untuk Admin QC.");
                        }

                        const actorLabel = (verifiedActor.role !== "admin" || reopenReason.indexOf("Otomatis OPEN") === 0)
                            ? "Sistem Otomatis (GDrive)"
                            : verifiedActor.username;

                        if (prevStatus === "CLOSED" || prevPhotos.length > 0 || prevNote) {
                            historyList.push({
                                status: "CLOSED",
                                photos: alivePhotos,
                                note: prevNote,
                                inspector: prevInspector,
                                updatedAt: prevUpdatedAt,
                                folderUrl: isDriveFolderAlive_(prevFolderUrl, driveCache) ? prevFolderUrl : "",
                                reopenedBy: actorLabel,
                                reopenedAt: reopenedAt,
                                reopenReason: reopenReason
                            });
                        }

                        const updatedFollowRow = [
                            key,
                            payload.productName,
                            payload.ncrId,
                            rows[i][3] || ("NCR-" + payload.ncrId),
                            "OPEN",
                            "",
                            "",
                            reopenedAt,
                            0,
                            isDriveFolderAlive_(prevFolderUrl, driveCache) ? prevFolderUrl : "",
                            "[]",
                            JSON.stringify(historyList),
                            actorLabel,
                            reopenedAt,
                            reopenReason
                        ];

                        shFollow.getRange(i + 1, 1, 1, updatedFollowRow.length).setValues([updatedFollowRow]);
                        break;
                    }
                }
            }
        }

        // 9. TAMBAH & HAPUS USER (FIX #3: HASH SHA-256 & CEK ANTI-DUPLIKAT)
        else if (action === "ADD_USER") {
            const shUsers = ss.getSheetByName(SHEETS.USERS);
            const cleanUsername = String(payload.username || "").trim();
            const userRowsCheck = shUsers.getDataRange().getValues();
            const isUserExist = userRowsCheck.slice(1).some(r =>
                String(r[1]).trim().toLowerCase() === cleanUsername.toLowerCase() ||
                String(r[0]) === String(payload.id)
            );

            if (!isUserExist && cleanUsername) {
                const hashedPassword = hashUserPassword_(cleanUsername, payload.password);
                shUsers.appendRow([payload.id, cleanUsername, hashedPassword, payload.role]);
            }
        }

        else if (action === "DELETE_USER") {
            deleteRowByValue_(ss.getSheetByName(SHEETS.USERS), 0, payload.id);
        }

        const updatedData = getAllPortalData_();
        return ContentService.createTextOutput(JSON.stringify({ status: "success", data: updatedData }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        const errMsg = err.message || err.toString();
        const isAuthErr = errMsg.indexOf("AUTH_ERROR:") === 0;
        return ContentService.createTextOutput(JSON.stringify({
            status: isAuthErr ? "auth_error" : "error",
            message: errMsg.replace("AUTH_ERROR: ", "").replace("FORBIDDEN: ", "")
        })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// ================= PEMBACAAN DATA & SINKRONISASI REAL-TIME GOOGLE DRIVE =================
function getAllPortalData_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd MMM yyyy, HH:mm");
    const driveCache = {};

    const shProd = ss.getSheetByName(SHEETS.PRODUCTS);
    const prodRows = shProd ? shProd.getDataRange().getValues() : [];
    const products = [];
    for (let i = 1; i < prodRows.length; i++) {
        if (!prodRows[i][0]) continue;
        products.push({ name: String(prodRows[i][0]), status: String(prodRows[i][1] || "active") });
    }

    const shUsers = ss.getSheetByName(SHEETS.USERS);
    const userRows = shUsers ? shUsers.getDataRange().getValues() : [];
    const users = [];
    for (let i = 1; i < userRows.length; i++) {
        if (!userRows[i][1]) continue;
        users.push({
            id: Number(userRows[i][0]),
            username: String(userRows[i][1]),
            role: String(userRows[i][3])
        });
    }

    const shNcr = ss.getSheetByName(SHEETS.NCR);
    if (shNcr && shNcr.getLastRow() > 0) {
        ensureSheetHeaders_(shNcr, MASTER_NCR_HEADERS, MASTER_NCR_WIDTHS);
    }
    const ncrRows = shNcr ? shNcr.getDataRange().getValues() : [];
    const masterNcrList = [];

    for (let i = ncrRows.length - 1; i >= 1; i--) {
        if (!ncrRows[i][0]) continue;
        const assigned = parseUnitsCell_(ncrRows[i][6]);
        const partStr = String(ncrRows[i][3] || "");
        let platform = String(ncrRows[i][8] || "").trim();
        let title = String(ncrRows[i][9] || "").trim();

        if (!platform && !title && partStr) {
            if (partStr.indexOf(" — ") !== -1) {
                const sp = partStr.split(" — ");
                platform = sp[0].trim();
                title = sp.slice(1).join(" — ").trim();
            } else {
                platform = partStr;
                title = partStr;
            }
        }

        const rawMasterPhotos = parseJsonArraySafe_(ncrRows[i][12]);
        const validMasterPhotos = filterAliveDrivePhotos_(rawMasterPhotos, "", driveCache);
        if (validMasterPhotos.length !== rawMasterPhotos.length && shNcr) {
            shNcr.getRange(i + 1, 13).setValue(JSON.stringify(validMasterPhotos));
        }

        masterNcrList.push({
            id: Number(ncrRows[i][0]),
            no: String(ncrRows[i][1] || ""),
            date: String(ncrRows[i][2] || ""),
            part: partStr,
            desc: String(ncrRows[i][4] || ""),
            assignedProducts: assigned,
            rawDate: String(ncrRows[i][7] || ""),
            platform: platform || "-",
            title: title || "-",
            gdriveLink: String(ncrRows[i][10] || ""),
            gdriveFileName: String(ncrRows[i][11] || ""),
            masterPhotos: validMasterPhotos
        });
    }

    const shFollow = ss.getSheetByName(SHEETS.FOLLOWUP);
    if (shFollow && shFollow.getLastRow() > 0) {
        ensureSheetHeaders_(shFollow, FOLLOWUP_HEADERS, FOLLOWUP_WIDTHS);
    }
    const followRows = shFollow ? shFollow.getDataRange().getValues() : [];
    const productFollowUps = {};

    for (let i = 1; i < followRows.length; i++) {
        const key = String(followRows[i][0] || "");
        if (!key) continue;

        const prodName = String(followRows[i][1] || "");
        const ncrId = followRows[i][2];
        const ncrNo = String(followRows[i][3] || ("NCR-" + ncrId));
        let status = String(followRows[i][4] || "CLOSED");
        let note = String(followRows[i][5] || "");
        let inspector = String(followRows[i][6] || "");
        let updatedAt = String(followRows[i][7] || "");
        let folderUrl = String(followRows[i][9] || "");
        const rawPhotos = parseJsonArraySafe_(followRows[i][10]);
        const history = parseJsonArraySafe_(followRows[i][11]);
        let reopenedBy = String(followRows[i][12] || "");
        let reopenedAt = String(followRows[i][13] || "");
        let reopenReason = String(followRows[i][14] || "");

        // Validasi ke Google Drive apakah folder & file foto masih ada (tidak di-Trash / dihapus)
        const folderAlive = isDriveFolderAlive_(folderUrl, driveCache);
        if (!folderAlive) {
            folderUrl = "";
        }
        const validPhotos = filterAliveDrivePhotos_(rawPhotos, folderUrl, driveCache);

        // KASUS 1: Status CLOSED tetapi semua foto di Google Drive telah dihapus -> Otomatis kembalikan ke OPEN (Merah)!
        if (status === "CLOSED" && validPhotos.length === 0) {
            const autoReason = "Otomatis OPEN: Bukti foto di Google Drive telah dihapus / tidak ditemukan";
            if (note || inspector) {
                history.push({
                    status: "CLOSED",
                    photos: [],
                    note: note,
                    inspector: inspector,
                    updatedAt: updatedAt,
                    folderUrl: folderUrl,
                    reopenedBy: "Sistem Otomatis (GDrive)",
                    reopenedAt: nowStr,
                    reopenReason: autoReason
                });
            }

            status = "OPEN";
            note = "";
            inspector = "";
            updatedAt = nowStr;
            reopenedBy = "Sistem Otomatis (GDrive)";
            reopenedAt = nowStr;
            reopenReason = autoReason;

            const revertedRow = [
                key,
                prodName,
                ncrId,
                ncrNo,
                "OPEN",
                "",
                "",
                nowStr,
                0,
                folderUrl,
                "[]",
                JSON.stringify(history),
                reopenedBy,
                reopenedAt,
                reopenReason
            ];
            shFollow.getRange(i + 1, 1, 1, revertedRow.length).setValues([revertedRow]);
        }
        // KASUS 2: Sebagian foto dihapus di GDrive (misal dari 3 foto sisa 1 foto) -> Update jumlah & daftar foto
        else if (validPhotos.length !== rawPhotos.length) {
            shFollow.getRange(i + 1, 9).setValue(validPhotos.length);
            shFollow.getRange(i + 1, 11).setValue(JSON.stringify(validPhotos));
        }

        productFollowUps[key] = {
            status: status,
            note: note,
            inspector: inspector,
            updatedAt: updatedAt,
            folderUrl: folderUrl,
            photos: validPhotos,
            history: history,
            reopenedBy: reopenedBy,
            reopenedAt: reopenedAt,
            reopenReason: reopenReason
        };
    }

    return { products, users, masterNcrList, productFollowUps };
}

function deleteRowByValue_(sheet, colIndexZeroBased, targetValue) {
    if (!sheet || sheet.getLastRow() <= 1) return;
    const rows = sheet.getDataRange().getValues();
    for (let i = rows.length - 1; i >= 1; i--) {
        if (String(rows[i][colIndexZeroBased]) === String(targetValue)) {
            sheet.deleteRow(i + 1);
        }
    }
}
