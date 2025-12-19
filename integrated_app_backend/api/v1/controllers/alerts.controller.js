var Models = require("../models/index.model");
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');
const { sequelize } = require('../models/index.model');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    getCameraSummary: async function (req, res) {
        try {
            const [results] = await sequelize.query(`
            SELECT 
              CameraId,
              COUNT(*) AS totalCount
            FROM Alerts
            WHERE CreatedAt >= NOW() - INTERVAL 100 DAY
            GROUP BY CameraId
          `);

            return res.status(200).json(results);
        } catch (error) {
            console.error('Error fetching camera summary:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    getAlertAnalyticsSummary: async function (req, res) {
        try {
            const [results] = await sequelize.query(`
        SELECT 
          aa.AlertAnalyticsId AS Analytics,
          aa.AlertAnalyticsName,
          COUNT(a.AlertId) AS totalCount,
          COUNT(CASE WHEN LOWER(a.Status) = 'unresolved' THEN 1 END) AS unresolvedCount
        FROM AlertAnalytics aa
        LEFT JOIN Alerts a ON aa.AlertAnalyticsName = a.Analytics 
          AND a.CreatedAt >= NOW() - INTERVAL 100 DAY
        GROUP BY aa.AlertAnalyticsId, aa.AlertAnalyticsName
        `);

            return res.status(200).json(results);
        } catch (error) {
            console.error('Error fetching alert analytics summary:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    countUnseenAlert: async function (req, res) {
        try {
            const count = await Models.Alerts.count({
                where: Sequelize.literal("LOWER(`Seen`) != 'yes'")
            });

            return res.status(200).json({ unseenCount: count });
        } catch (error) {
            console.error('Error fetching unseen alerts count:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    countAlertsByStatus: async function (req, res) {
        try {
            // const companyId = req.query.companyId;

            // // Base where clause
            const whereCondition = {};
            // if (companyId) {
            //     whereCondition.CompanyID = companyId; // Adjust this field name based on actual schema
            // }

            // Count per status
            const [pending, resolved, unresolved, total] = await Promise.all([
                Models.Alerts.count({
                    where: { ...whereCondition, Status: 'Pending' }
                }),
                Models.Alerts.count({
                    where: { ...whereCondition, Status: 'Resolved' }
                }),
                Models.Alerts.count({
                    where: { ...whereCondition, Status: 'Unresolved' }
                }),
                Models.Alerts.count({
                    where: whereCondition
                })
            ]);

            res.status(200).json({
                msg: "success",
                data: {
                    pending,
                    resolved,
                    unresolved,
                    all: total
                }
            });
        } catch (err) {
            console.error(err);
            res.status(400).json({
                msg: "Fail",
                data: err
            });
        }
    },

    getFilteredAlerts: async function (req, res) {
        try {
            const {
                alert,
                building,
                cam,
                edate,
                floor,
                sdate,
                site,
                status,
                offset = 0,
                limit = 10
            } = req.body;

            const where = {};
            const includeConditions = [];

            // Apply filters if values are provided
            if (alert) where.Analytics = alert;
            if (cam && cam.length && !cam.includes('all')) {
                where.CameraId = { [Op.in]: cam };
            }
            if (status && status !== 'all') {
                where.Status = status;
            }
            if (sdate && edate) {
                where.CreatedAt = {
                    [Op.between]: [new Date(sdate), new Date(edate)]
                };
            } else if (sdate) {
                where.CreatedAt = { [Op.gte]: new Date(sdate) };
            } else if (edate) {
                where.CreatedAt = { [Op.lte]: new Date(edate) };
            }

            // Handle site, building, and floor filters through relationships
            if (site) {
                includeConditions.push({
                    model: Models.Camera,
                    attributes: ["CameraName"],
                    required: true,
                    as: 'Camera',
                    include: {
                        model: Models.Floor,
                        attributes: ["FloorName"],
                        required: true,
                        as: 'Floor',
                        include: {
                            model: Models.Building,
                            attributes: ["BuildingName"],
                            required: true,
                            as: 'Building',
                            where: { SiteId: site },
                            include: {
                                model: Models.Site,
                                attributes: ["SiteName"],
                                required: true,
                                as: 'Site'
                            }
                        }
                    }
                });
            } else if (building) {
                includeConditions.push({
                    model: Models.Camera,
                    attributes: ["CameraName"],
                    required: true,
                    as: 'Camera',
                    include: {
                        model: Models.Floor,
                        attributes: ["FloorName"],
                        required: true,
                        as: 'Floor',
                        include: {
                            model: Models.Building,
                            attributes: ["BuildingName"],
                            as: 'Building',
                            required: true,
                            where: { BuildingId: building },
                            include: {
                                model: Models.Site,
                                required: true,
                                attributes: ["SiteName"],
                                as: 'Site'
                            }
                        }
                    }
                });
            } else if (floor) {
                includeConditions.push({
                    model: Models.Camera,
                    attributes: ["CameraName"],
                    required: true,
                    as: 'Camera',
                    include: {
                        model: Models.Floor,
                        attributes: ["FloorName"],
                        required: true,
                        as: 'Floor',
                        where: { FloorId: floor },
                        include: {
                            model: Models.Building,
                            attributes: ["BuildingName"],
                            as: 'Building',
                            required: true,
                            include: {
                                model: Models.Site,
                                required: true,
                                attributes: ["SiteName"],
                                as: 'Site'
                            }
                        }
                    }
                });
            }

            // Build include array - use conditional includes if site/building/floor filters are applied
            let includeArray = [];

            if (includeConditions.length > 0) {
                // Use conditional includes for site/building/floor filtering
                includeArray = [
                    ...includeConditions,
                    {
                        model: Models.AlertAnalytics,
                        attributes: ["AlertAnalyticsName"],
                        as: 'AlertAnalytics'
                    }
                ];
            } else {
                // Use default includes when no site/building/floor filtering
                includeArray = [
                    {
                        model: Models.Camera,
                        attributes: ["CameraName"],
                        required: true,
                        as: 'Camera',
                        include: {
                            model: Models.Floor,
                            attributes: ["FloorName"],
                            required: true,
                            as: 'Floor',
                            include: {
                                model: Models.Building,
                                attributes: ["BuildingName"],
                                required: true,
                                as: 'Building',
                                include: {
                                    model: Models.Site,
                                    attributes: ["SiteName"],
                                    required: true,
                                    as: 'Site'
                                }
                            }
                        },
                    },
                    {
                        model: Models.AlertAnalytics,
                        attributes: ["AlertAnalyticsName"],
                        as: 'AlertAnalytics'
                    }
                ];
            }

            // Fetch paginated data
            const result = await Models.Alerts.findAndCountAll({
                where,
                include: includeArray,
                offset: parseInt(offset),
                limit: parseInt(limit),
                order: [['CreatedAt', 'DESC']]
            });

            res.status(200).json({
                msg: "success",
                data: {
                    total: result.count,
                    offset: parseInt(offset),
                    limit: parseInt(limit),
                    rows: result.rows
                }
            });
        } catch (error) {
            console.error(error);
            res.status(400).json({
                msg: "fail",
                error: error.message
            });
        }
    },
    // update alert
    updateAlertById: function (req, res) {
        Models.Alerts.update(req.body, {
            where: {
                AlertId: req.params.id
            }
        }).then(async (affectedrows) => {
            res.status(200).json({
                "msg": "success",
                "data": affectedrows
            });
        }).catch((error) => {
            console.log(error);
            res.status(400).json({
                "msg": "error",
                "data": error
            });
        });
    },

    getAlertStatusSummaryForAnalytics: async function (req, res) {
        try {
            const { alert, cam, sdate, edate, status } = req.body;

            // Build WHERE conditions
            let whereClause = `WHERE 1=1`;

            if (alert) {
                whereClause += ` AND A.Analytics = :alert`;
            }

            if (cam && Array.isArray(cam) && !cam.includes('all')) {
                whereClause += ` AND A.CameraId IN (:cam)`;
            }

            if (status && status !== 'all') {
                whereClause += ` AND A.Status = :status`;
            }

            if (sdate && edate) {
                whereClause += ` AND A.CreatedAt BETWEEN :sdate AND :edate`;
            } else if (sdate) {
                whereClause += ` AND A.CreatedAt >= :sdate`;
            } else if (edate) {
                whereClause += ` AND A.CreatedAt <= :edate`;
            }

            // Query grouped by Status
            const [results] = await sequelize.query(
                `
                SELECT 
                    A.Status,
                    COUNT(*) AS count
                FROM Alerts A
                ${whereClause}
                GROUP BY A.Status
                `,
                {
                    replacements: {
                        alert,
                        cam,
                        status,
                        sdate,
                        edate
                    }
                }
            );

            res.status(200).json({
                msg: "success",
                data: results
            });
        } catch (error) {
            console.error('Error fetching alert status summary:', error);
            res.status(500).json({ msg: 'Internal server error' });
        }
    },

    getAlertCameraSummaryForAnalytics: async function (req, res) {
        try {
            const { alert, cam, sdate, edate, status } = req.body;

            // Build filter clause for Alerts table
            let alertFilters = `WHERE 1=1`;

            if (alert) {
                alertFilters += ` AND A.Analytics = :alert`;
            }

            if (cam && Array.isArray(cam) && !cam.includes('all')) {
                alertFilters += ` AND C.CameraId IN (:cam)`; // Filter on Camera, not Alerts
            }

            if (status && status !== 'all') {
                alertFilters += ` AND A.Status = :status`;
            }

            if (sdate && edate) {
                alertFilters += ` AND A.CreatedAt BETWEEN :sdate AND :edate`;
            } else if (sdate) {
                alertFilters += ` AND A.CreatedAt >= :sdate`;
            } else if (edate) {
                alertFilters += ` AND A.CreatedAt <= :edate`;
            }

            const [results] = await sequelize.query(
                `
                SELECT 
                    C.CameraId,
                    C.CameraName,
                    COUNT(A.AlertId) AS count
                FROM Camera C
                LEFT JOIN Alerts A ON A.CameraId = C.CameraId
                ${alertFilters.replace("WHERE", "AND")}
                GROUP BY C.CameraId, C.CameraName
                ORDER BY count DESC
                `,
                {
                    replacements: {
                        alert,
                        cam,
                        status,
                        sdate,
                        edate
                    }
                }
            );

            res.status(200).json({
                msg: "success",
                data: results
            });
        } catch (error) {
            console.error('Error fetching camera summary:', error);
            res.status(500).json({ msg: 'Internal server error' });
        }
    },

    getAlertAnalyticsSummaryForAnalytics: async function (req, res) {
        try {
            const { alert, cam, sdate, edate, status } = req.body;

            // Build WHERE clause for Alerts table
            let alertWhereClause = `WHERE 1=1`;

            if (alert) {
                alertWhereClause += ` AND A.Analytics = :alert`;
            }

            if (cam && Array.isArray(cam) && !cam.includes('all')) {
                alertWhereClause += ` AND A.CameraId IN (:cam)`;
            }

            if (status && status !== 'all') {
                alertWhereClause += ` AND A.Status = :status`;
            }

            if (sdate && edate) {
                alertWhereClause += ` AND A.CreatedAt BETWEEN :sdate AND :edate`;
            } else if (sdate) {
                alertWhereClause += ` AND A.CreatedAt >= :sdate`;
            } else if (edate) {
                alertWhereClause += ` AND A.CreatedAt <= :edate`;
            }

            const [results] = await sequelize.query(
                `
                SELECT 
                    AA.AlertAnalyticsId AS Analytics,
                    AA.AlertAnalyticsName,
                    COUNT(A.AlertId) AS count
                FROM AlertAnalytics AA
                -- *** FIX: Join on Name instead of ID ***
                LEFT JOIN Alerts A ON A.Analytics = AA.AlertAnalyticsName
                ${alertWhereClause.replace('WHERE', 'AND')}
                GROUP BY AA.AlertAnalyticsId, AA.AlertAnalyticsName
                ORDER BY count DESC
                `,
                {
                    replacements: {
                        alert,
                        cam,
                        status,
                        sdate,
                        edate
                    }
                }
            );

            res.status(200).json({
                msg: "success",
                data: results
            });
        } catch (error) {
            console.error('Error fetching alert analytics summary:', error);
            res.status(500).json({ msg: 'Internal server error' });
        }
    },

    downloadPdf: async function (req, res) {
        try {
            const {
                alert,
                cam,
                edate,
                sdate,
                status,
                site,
                building,
                floor
            } = req.query;

            const where = {};
            const includeConditions = [];

            // Apply filters if values are provided
            if (alert) where.Analytics = alert;
            if (cam && cam.length && !cam.includes('all')) {
                where.CameraId = { [Op.in]: cam.split(',') };
            }
            if (status && status !== 'all') {
                where.Status = status;
            }
            if (sdate && edate) {
                where.CreatedAt = {
                    [Op.between]: [new Date(sdate), new Date(edate)]
                };
            } else if (sdate) {
                where.CreatedAt = { [Op.gte]: new Date(sdate) };
            } else if (edate) {
                where.CreatedAt = { [Op.lte]: new Date(edate) };
            }

            // Handle site, building, and floor filters through relationships
            if (site) {
                includeConditions.push({
                    model: Models.Camera,
                    attributes: ["CameraName"],
                    required: true,
                    as: 'Camera',
                    include: {
                        model: Models.Floor,
                        attributes: ["FloorName"],
                        required: true,
                        as: 'Floor',
                        include: {
                            model: Models.Building,
                            attributes: ["BuildingName"],
                            as: 'Building',
                            required: true,
                            where: { SiteId: site },
                            include: {
                                model: Models.Site,
                                required: true,
                                attributes: ["SiteName"],
                                as: 'Site'
                            }
                        }
                    }
                });
            } else if (building) {
                includeConditions.push({
                    model: Models.Camera,
                    attributes: ["CameraName"],
                    required: true,
                    as: 'Camera',
                    include: {
                        model: Models.Floor,
                        attributes: ["FloorName"],
                        required: true,
                        as: 'Floor',
                        include: {
                            model: Models.Building,
                            attributes: ["BuildingName"],
                            as: 'Building',
                            required: true,
                            where: { BuildingId: building },
                            include: {
                                model: Models.Site,
                                required: true,
                                attributes: ["SiteName"],
                                as: 'Site'
                            }
                        }
                    }
                });
            } else if (floor) {
                includeConditions.push({
                    model: Models.Camera,
                    attributes: ["CameraName"],
                    required: true,
                    as: 'Camera',
                    include: {
                        model: Models.Floor,
                        attributes: ["FloorName"],
                        required: true,
                        as: 'Floor',
                        where: { FloorId: floor },
                        include: {
                            model: Models.Building,
                            attributes: ["BuildingName"],
                            as: 'Building',
                            required: true,
                            include: {
                                model: Models.Site,
                                required: true,
                                attributes: ["SiteName"],
                                as: 'Site'
                            }
                        }
                    }
                });
            }

            // Build include array
            let includeArray = [];

            if (includeConditions.length > 0) {
                includeArray = [
                    ...includeConditions,
                    {
                        model: Models.AlertAnalytics,
                        attributes: ["AlertAnalyticsName"],
                        as: 'AlertAnalytics'
                    }
                ];
            } else {
                includeArray = [
                    {
                        model: Models.Camera,
                        attributes: ["CameraName"],
                        as: 'Camera',
                        include: {
                            model: Models.Floor,
                            attributes: ["FloorName"],
                            as: 'Floor',
                            include: {
                                model: Models.Building,
                                attributes: ["BuildingName"],
                                as: 'Building',
                                include: {
                                    model: Models.Site,
                                    attributes: ["SiteName"],
                                    as: 'Site'
                                }
                            }
                        },
                    },
                    {
                        model: Models.AlertAnalytics,
                        attributes: ["AlertAnalyticsName"],
                        as: 'AlertAnalytics'
                    }
                ];
            }

            // Fetch all alerts data for PDF
            const alerts = await Models.Alerts.findAll({
                where,
                include: includeArray,
                order: [['CreatedAt', 'DESC']]
            });

            // Generate PDF with landscape orientation for better table layout
            const doc = new PDFDocument({
                margin: 20,
                size: 'A4',
                layout: 'landscape'
            });
            const fileName = `alerts_report_${uuidv4()}.pdf`;
            const filePath = path.join(__dirname, '../../../public/uploads', fileName);

            console.log('PDF file path:', filePath);
            console.log('Current working directory:', process.cwd());

            // Ensure uploads directory exists
            const uploadsDir = path.dirname(filePath);
            console.log('Uploads directory:', uploadsDir);
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
                console.log('Created uploads directory:', uploadsDir);
            } else {
                console.log('Uploads directory already exists:', uploadsDir);
            }

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Add error handling for the write stream
            writeStream.on('error', (error) => {
                console.error('Error writing PDF file:', error);
                res.status(500).json({
                    msg: "Error writing PDF file",
                    error: error.message
                });
            });

            // PDF Header
            doc.fontSize(20).text('Alert Report', { align: 'center' });
            doc.moveDown();

            // Filter information
            doc.fontSize(12).text('Filter Information:', { underline: true });
            doc.moveDown(0.5);

            if (site) doc.text(`Site: ${site}`);
            if (building) doc.text(`Building: ${building}`);
            if (floor) doc.text(`Floor: ${floor}`);
            if (status && status !== 'all') doc.text(`Status: ${status}`);
            if (alert) doc.text(`Alert Type: ${alert}`);
            if (sdate) doc.text(`Start Date: ${sdate}`);
            if (edate) doc.text(`End Date: ${edate}`);

            doc.moveDown();
            doc.text(`Total Alerts: ${alerts.length}`);
            doc.moveDown();

            // Table headers - A4 landscape width is ~770px, minus margins = ~700px available
            const tableTop = doc.y;
            const colWidths = [50, 50, 60, 60, 60, 60, 50, 50, 60, 40, 40];
            const colHeaders = ['Time', 'Date', 'Alert', 'Camera', 'Region', 'Subregion', 'Floor', 'Status', 'Remarks', 'Snap', 'Snap'];

            // Draw table headers
            doc.fontSize(8).font('Helvetica-Bold');
            let x = 20;
            colHeaders.forEach((header, i) => {
                const maxChars = Math.floor(colWidths[i] / 3);
                const displayHeader = header.length > maxChars ? header.substring(0, maxChars - 3) + '...' : header;
                doc.text(displayHeader, x, tableTop, { width: colWidths[i], align: 'center' });
                x += colWidths[i];
            });

            // Draw header line
            doc.moveTo(20, tableTop + 12).lineTo(20 + colWidths.reduce((a, b) => a + b, 0), tableTop + 12).stroke();

            // Reset font to normal for data rows
            doc.font('Helvetica');

            // Table data
            let currentY = tableTop + 20;
            alerts.forEach((alert, index) => {
                // Check if we need a new page (adjusted for taller rows with images)
                if (currentY > 450) {
                    doc.addPage();

                    // Redraw table headers on new page
                    const newTableTop = 50;
                    doc.fontSize(8).font('Helvetica-Bold');
                    let headerX = 20;
                    colHeaders.forEach((header, i) => {
                        const maxChars = Math.floor(colWidths[i] / 3);
                        const displayHeader = header.length > maxChars ? header.substring(0, maxChars - 3) + '...' : header;
                        doc.text(displayHeader, headerX, newTableTop, { width: colWidths[i], align: 'center' });
                        headerX += colWidths[i];
                    });

                    // Draw header line on new page
                    doc.moveTo(20, newTableTop + 12).lineTo(20 + colWidths.reduce((a, b) => a + b, 0), newTableTop + 12).stroke();

                    // Reset font and position for data rows
                    doc.font('Helvetica');
                    currentY = newTableTop + 20;
                }

                const rowData = [
                    alert.CreatedAt ? new Date(alert.CreatedAt).toLocaleTimeString() : 'N/A',
                    alert.CreatedAt ? new Date(alert.CreatedAt).toLocaleDateString() : 'N/A',
                    alert.AlertAnalytics?.AlertAnalyticsName || 'N/A',
                    alert.Camera?.CameraName || 'N/A',
                    alert.Camera?.Floor?.Building?.Site?.SiteName || 'N/A',
                    alert.Camera?.Floor?.Building?.BuildingName || 'N/A',
                    alert.Camera?.Floor?.FloorName || 'N/A',
                    alert.Status || 'N/A',
                    alert.Remarks || 'N/A',
                    alert.Image1 || alert.Image2 || 'NO_IMAGE', // First snap column
                    alert.Image1 || alert.Image2 || 'NO_IMAGE'  // Second snap column
                ];

                x = 20;
                rowData.forEach((data, i) => {
                    if (i === 9 || i === 10) { // Snap columns (indices 9 and 10)
                        // Temporarily disable actual image processing to prevent crashes
                        // Always show dummy images for now
                        const imageWidth = 30;
                        const imageHeight = 20;
                        const imageX = x + (colWidths[i] - imageWidth) / 2;
                        const imageY = currentY - 2;

                        // Draw a simple rectangle as dummy image
                        doc.rect(imageX, imageY, imageWidth, imageHeight);
                        doc.stroke();

                        // Show different text based on whether image data exists
                        if (data === 'NO_IMAGE') {
                            doc.fontSize(6).text('No Image', imageX, imageY + 6, {
                                width: imageWidth,
                                align: 'center'
                            });
                        } else {
                            doc.fontSize(6).text('Image', imageX, imageY + 6, {
                                width: imageWidth,
                                align: 'center'
                            });
                        }
                    } else {
                        // Truncate long text to fit column width
                        const text = data.toString();
                        const maxChars = Math.floor(colWidths[i] / 3);
                        const displayText = text.length > maxChars ? text.substring(0, maxChars - 3) + '...' : text;
                        doc.text(displayText, x, currentY, { width: colWidths[i], align: 'center' });
                    }
                    x += colWidths[i];
                });

                currentY += 25; // Increased row height to accommodate images
            });

            doc.end();

            // Wait for PDF to be written
            writeStream.on('finish', () => {
                console.log('PDF file written successfully:', filePath);

                // Verify file exists
                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    console.log('File exists, size:', stats.size, 'bytes');
                } else {
                    console.error('File was not created:', filePath);
                }

                if (!res.headersSent) {
                    res.status(200).json({
                        msg: "PDF generated successfully",
                        data: `/uploads/${fileName}`
                    });
                }
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({
                msg: "Error generating PDF",
                error: error.message
            });
        }
    }
}