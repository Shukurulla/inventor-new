import jsPDF from "jspdf";
import { LogoLight } from "../../public";

// Helper function to load image and convert to base64
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = this.naturalWidth || this.width || 200;
        canvas.height = this.naturalHeight || this.height || 200;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this, 0, 0);

        const dataURL = canvas.toDataURL("image/png", 1.0);
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = function (error) {
      reject(new Error(`Failed to load image: ${url}`));
    };

    img.src = url;
  });
};

// Function to load company logo
const loadCompanyLogo = async () => {
  try {
    // Try to load logo from public folder or CDN
    const logoUrl = LogoLight; // Adjust path as needed
    return await loadImageAsBase64(logoUrl);
  } catch (error) {
    console.warn("Logo not found, using placeholder");
    return null;
  }
};

// Function to create QR code placeholder
const createQRPlaceholder = (pdf, x, y, size, text = "QR") => {
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(1);
  pdf.rect(x, y, size, size);
  pdf.setFillColor(245, 245, 245);
  pdf.rect(x + 1, y + 1, size - 2, size - 2, "F");
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(text, x + size / 2, y + size / 2, { align: "center" });
};

// Enhanced QR code PDF generator with logo and 4 items per row
export const generateQRCodesPDF = async (equipmentData) => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Layout constants
    const margin = 10;
    const headerHeight = 25;
    const itemsPerRow = 4; // Changed from 2 to 4
    const rowsPerPage = 6; // Increased from 4 to 6
    const itemsPerPage = itemsPerRow * rowsPerPage;
    const itemWidth = (pageWidth - margin * (itemsPerRow + 1)) / itemsPerRow;
    const itemHeight = (pageHeight - headerHeight - margin * 2) / rowsPerPage;

    let currentPage = 1;
    let processedItems = 0;

    // Load company logo
    const logoBase64 = await loadCompanyLogo();

    // Add header with logo
    const addHeader = (pageNum) => {
      // Add logo if available
      if (logoBase64) {
        try {
          pdf.addImage(logoBase64, "PNG", margin, 8, 30, 12); // Logo positioned at top-left
        } catch (error) {
          console.warn("Failed to add logo to PDF:", error);
        }
      }

      // Page number
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Sahifa ${pageNum}`, pageWidth - margin, 15, { align: "right" });

      // Add separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, headerHeight - 2, pageWidth - margin, headerHeight - 2);
    };

    addHeader(currentPage);

    // Process each equipment item
    for (let i = 0; i < equipmentData.length; i++) {
      const equipment = equipmentData[i];

      // Check if we need a new page
      if (processedItems > 0 && processedItems % itemsPerPage === 0) {
        pdf.addPage();
        currentPage++;
        addHeader(currentPage);
      }

      // Calculate position (4 items per row)
      const itemIndex = processedItems % itemsPerPage;
      const column = itemIndex % itemsPerRow;
      const row = Math.floor(itemIndex / itemsPerRow);
      const x = margin + column * (itemWidth + margin);
      const y = headerHeight + row * itemHeight;

      // Draw item border (optional)
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.3);
      pdf.rect(x, y, itemWidth, itemHeight);

      // Equipment name
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      const equipmentName = equipment.name || "Equipment";
      const nameLines = pdf.splitTextToSize(equipmentName, itemWidth - 6);
      let currentTextY = y + 6;

      // Limit to 2 lines for equipment name
      for (let j = 0; j < Math.min(nameLines.length, 2); j++) {
        pdf.text(nameLines[j], x + 3, currentTextY);
        currentTextY += 4;
      }

      // Add INN below equipment name
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      currentTextY += 2;
      pdf.text(`INN: ${equipment.inn || "N/A"}`, x + 3, currentTextY);

      // QR Code section
      const qrSize = 20; // Adjusted QR code size
      const qrX = x + (itemWidth - qrSize) / 2; // Center QR code
      const qrY = currentTextY + 4; // Place below INN

      // Generate QR code URL
      let qrCodeUrl = null;
      if (equipment.inn) {
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${equipment.inn}&size=200x200&bgcolor=FFFFFF&color=000000&format=png&margin=2`;
      }

      // Try to load and add QR code
      if (qrCodeUrl) {
        try {
          const qrImageData = await loadImageAsBase64(qrCodeUrl);
          pdf.addImage(qrImageData, "PNG", qrX, qrY, qrSize, qrSize);
        } catch (qrError) {
          createQRPlaceholder(pdf, qrX, qrY, qrSize, "ERROR");
        }
      } else {
        createQRPlaceholder(pdf, qrX, qrY, qrSize, "NO INN");
      }

      // // Add equipment type below QR code
      // pdf.setFontSize(7);
      // pdf.setTextColor(100, 100, 100);
      // const typeText = equipment.type_data?.name || "Unknown Type";
      // const typeY = qrY + qrSize + 3;
      // pdf.text(typeText, x + itemWidth / 2, typeY, { align: "center" });

      processedItems++;
    }

    // Add footer to all pages
    const totalPages = Math.ceil(equipmentData.length / itemsPerPage);
    for (let page = 1; page <= totalPages; page++) {
      if (page > 1) {
        pdf.setPage(page);
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);

      // Left footer - creation date
      pdf.text(
        `Yaratilgan: ${new Date().toLocaleDateString("uz-UZ")}`,
        margin,
        pageHeight - 5
      );

      // Right footer - total items
      pdf.text(
        `Jami ${equipmentData.length} ta element`,
        pageWidth - margin,
        pageHeight - 5,
        { align: "right" }
      );

      // Center footer - page info
      pdf.text(`${page} / ${totalPages}`, pageWidth / 2, pageHeight - 5, {
        align: "center",
      });
    }

    // Save PDF
    const currentDate = new Date().toISOString().split("T")[0];
    const fileName = `inventar-qr-codes-${currentDate}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    throw new Error(`PDF yaratishda xatolik: ${error.message}`);
  }
};
