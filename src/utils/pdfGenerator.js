import jsPDF from "jspdf";

// Helper function to load image and convert to base64
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      try {
        console.log("Image loaded successfully:", this.src);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = this.naturalWidth || this.width || 200;
        canvas.height = this.naturalHeight || this.height || 200;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this, 0, 0);

        const dataURL = canvas.toDataURL("image/png", 1.0);
        console.log("Successfully converted to base64");
        resolve(dataURL);
      } catch (error) {
        console.error("Canvas error:", error);
        reject(error);
      }
    };

    img.onerror = function (error) {
      console.error("Image load error:", error);
      reject(new Error(`Failed to load image: ${url}`));
    };

    console.log("Loading image from:", url);
    img.src = url;
  });
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

// Enhanced QR code PDF generator with fixed layout
export const generateQRCodesPDF = async (equipmentData) => {
  try {
    console.log("Starting PDF generation with data:", equipmentData);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Layout constants - TUZATILGAN
    const margin = 15;
    const headerHeight = 30;
    const footerHeight = 15;
    const availableHeight = pageHeight - headerHeight - footerHeight - margin;

    // Item layout (2 columns, 3 rows per page) - ANIQROQ HISOB-KITOB
    const itemsPerRow = 2;
    const rowsPerPage = 3;
    const itemsPerPage = itemsPerRow * rowsPerPage;

    const itemWidth = (pageWidth - margin * 3) / itemsPerRow; // 2 ta margin: chap, o'rta
    const itemHeight = availableHeight / rowsPerPage; // 3 ta qator uchun tenglashtirish

    let currentPage = 1;
    let processedItems = 0;

    // Add header function
    const addHeader = (pageNum) => {
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("QR Kodlar - Inventar ma'lumotlari", margin, 20);

      if (equipmentData.length > itemsPerPage) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Sahifa ${pageNum}`, pageWidth - margin, 20, {
          align: "right",
        });
        pdf.text(`Jami: ${equipmentData.length} dona`, pageWidth - margin, 26, {
          align: "right",
        });
      }
    };

    // Add first page header
    addHeader(currentPage);

    // Process each equipment item
    for (let i = 0; i < equipmentData.length; i++) {
      const equipment = equipmentData[i];
      console.log(`Processing equipment ${i + 1}:`, equipment.name);

      // Check if we need a new page
      if (processedItems > 0 && processedItems % itemsPerPage === 0) {
        pdf.addPage();
        currentPage++;
        addHeader(currentPage);
      }

      // Calculate position - TUZATILGAN POZITSIYA HISOB-KITOBI
      const itemIndex = processedItems % itemsPerPage;
      const column = itemIndex % itemsPerRow; // 0 yoki 1
      const row = Math.floor(itemIndex / itemsPerRow); // 0, 1, yoki 2

      const x = margin + column * (itemWidth + margin);
      const y = headerHeight + row * itemHeight;

      console.log(
        `Item ${i + 1}: column=${column}, row=${row}, x=${x}, y=${y}`
      );

      // Draw item container with better styling
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.setFillColor(250, 250, 250);
      pdf.rect(x, y, itemWidth, itemHeight - 5, "FD"); // Fill and Draw

      // Equipment information section
      const textStartX = x + 8;
      const textStartY = y + 15;

      // Equipment name
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);

      const equipmentName = equipment.name || "Equipment";
      const nameLines = pdf.splitTextToSize(equipmentName, itemWidth - 60);

      let currentTextY = textStartY;
      for (let j = 0; j < Math.min(nameLines.length, 2); j++) {
        pdf.text(nameLines[j], textStartX, currentTextY);
        currentTextY += 6;
      }

      // Equipment details
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);

      // INN
      currentTextY += 3;
      pdf.text(`INN: ${equipment.inn || "N/A"}`, textStartX, currentTextY);

      // QR Code section - YAXSHILANGAN
      const qrSize = 45;
      const qrX = x + itemWidth - qrSize - 8;
      const qrY = y + 8;

      // QR kod uchun background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, "F");

      // Generate QR code URL
      let qrCodeUrl = null;
      if (equipment.inn) {
        // Create comprehensive QR data
        const qrData = JSON.stringify({
          inn: equipment.inn,
          name: equipment.name,
          type: equipment.type_data?.name || "Unknown",
          id: equipment.id,
        });

        const encodedData = encodeURIComponent(qrData);
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedData}&size=300x300&bgcolor=FFFFFF&color=000000&format=png&margin=10`;
        console.log(`Generated QR URL for "${equipment.name}": ${qrCodeUrl}`);
      }

      // Try to load and add QR code
      if (qrCodeUrl) {
        try {
          console.log(`Processing QR code for "${equipment.name}"`);
          const qrImageData = await loadImageAsBase64(qrCodeUrl);
          pdf.addImage(qrImageData, "PNG", qrX, qrY, qrSize, qrSize);
          console.log(`✅ Successfully added QR code for "${equipment.name}"`);
        } catch (qrError) {
          console.error(
            `❌ QR code loading failed for "${equipment.name}":`,
            qrError.message
          );
          createQRPlaceholder(pdf, qrX, qrY, qrSize, "ERROR");
        }
      } else {
        console.log(
          `⚠️ No INN available for QR code generation for "${equipment.name}"`
        );
        createQRPlaceholder(pdf, qrX, qrY, qrSize, "NO INN");
      }

      processedItems++;
    }

    // Add footer to all pages
    const totalPages = Math.ceil(equipmentData.length / itemsPerPage);
    for (let page = 1; page <= totalPages; page++) {
      if (page > 1) {
        pdf.setPage(page);
      }

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `iMaster - Inventar boshqaruv tizimi | ${new Date().toLocaleDateString(
          "uz-UZ"
        )}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Generate filename
    const currentDate = new Date().toISOString().split("T")[0];
    const fileName = `qr-codes-${currentDate}.pdf`;

    // Save PDF
    pdf.save(fileName);
    console.log("PDF generation completed successfully");

    return true;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(`Ошибка при создании PDF: ${error.message}`);
  }
};
