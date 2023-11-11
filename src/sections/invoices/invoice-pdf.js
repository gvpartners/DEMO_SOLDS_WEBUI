import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generatePDF = (invoice) => {
    const formattedDate = new Date(invoice.createdOn).toLocaleDateString("es-ES", {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Calcular la fecha válida hasta un mes después
    const validUntilDate = new Date(invoice.createdOn);
    validUntilDate.setMonth(validUntilDate.getMonth() + 1);

    // Formatear la fecha válida hasta en el formato deseado
    const validUntilFormatted = validUntilDate.toLocaleDateString("es-ES", {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const colorInvoice = [241, 206, 0];
    const textColorInvoice = [1, 53, 103]
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = `COTIZACIÓN ${invoice.selectedCategory} UNICON / ${invoice.invoiceCode}`;
    const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2;
    doc.setTextColor(1, 53, 103);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, titleX, 15);
    const underlineX = titleX;
    doc.setDrawColor(0);
    doc.line(underlineX, 17, underlineX + titleWidth, 17);

    const logoX = 15;
    const logoY = 25;
    const imgData = '/assets/avatars/unicon.png';
    doc.addImage(imgData, 'PNG', logoX, logoY, 30, 30);

    // Calcular la posición inicial y el ancho de la tabla 1
    const table1X = logoX + 45;
    // Calcular la posición inicial y el ancho de la tabla 1

    // Contenido de la tabla 1 (1 columna, 5 filas)
    const tableData1 = [
        [`UNION DE CONCRETERAS S.A`],
        [`RUC: 20297543653`],
        [`Carretera Panamericana Sur Km 11.400 Fundo Chilcal`],
        [`San Juan de Miraflores - Lima - Lima`]
    ];

    // Configurar la tabla 1 para que sea transparente y sin bordes
    doc.autoTable({
        startY: logoY,
        body: tableData1,
        theme: 'plain',
        tableLineColor: [255, 255, 255],
        tableLineWidth: 0,
        margin: { left: table1X },
        tableWidth: 'auto',
        showHeader: 'never',
        styles: { fontStyle: 'bold', textColor: textColorInvoice }
    });

    const tableHeader0 = [
        { content: 'INFORMACIÓN GENERAL', styles: { fillColor: colorInvoice, fontSize: 12 } },
        { content: '', styles: { fillColor: colorInvoice } }
    ];
    const tableData0 = [
        [`Categoria:`, invoice.selectedCategory],
        [`Fecha de elaboración:`, formattedDate],
        [`Válido hasta:`, validUntilFormatted],
        [`Elaborado por:`, invoice.employee],
        ['Cargo:', 'Ejecutivo de ventas']
    ];

    // Configurar la tabla 2
    doc.autoTable({
        startY: table1X,
        head: [tableHeader0],
        body: tableData0,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        styles: {
            textColor: textColorInvoice
        }
    });
    // Ajuste de posición para la tabla 2
    const table2Y = logoY + doc.autoTable.previous.finalY - 20;

    // Encabezados de la tabla 2
    const tableHeader11 = [
        { content: 'CLIENTE', styles: { fillColor: colorInvoice, fontSize: 12 } },
        { content: '', styles: { fillColor: colorInvoice } }
    ];
    const tableData11 = [
        [`Nombre:`, invoice.identificationInfo],
        [`${invoice.identificationType}:`, invoice.documentInfo],
        [`Correo electrónico:`, invoice.email],
        [`Teléfono:`, invoice.telephone || 'XXX-XXX-XXX'],
    ];

    // Configurar la tabla 2
    doc.autoTable({
        startY: table2Y,
        head: [tableHeader11],
        body: tableData11,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        styles: {
            textColor: textColorInvoice
        }
    });

    const tableHeader12 = [
        { content: 'MODALIDAD DE DESPACHO', styles: { fillColor: colorInvoice, fontSize: 12 } },
        { content: '', styles: { fillColor: colorInvoice } }
    ];
    const tableData12 = [
        [`Tipo de entrega:`, invoice.deliveryType],
        [`Distrito:`, invoice.selectedDistrict],
        [`Dirección:`, invoice.address]
    ];

    // Configurar la tabla 2
    doc.autoTable({
        startY: table2Y + doc.autoTable.previous.finalY - 105,
        head: [tableHeader12],
        body: tableData12,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        styles: {
            textColor: textColorInvoice
        }
    });

    doc.addPage();
    // Contenido de la tabla 1 (1 columna, 5 filas)
    const details = [
        [`DETALLE`]
    ];

    doc.autoTable({
        startY: table2Y + doc.autoTable.previous.finalY - 290,
        body: details,
        theme: 'plain',
        tableLineColor: [255, 255, 255],
        tableWidth: 'auto',
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        styles: { fontStyle: 'bold', fontSize: 12, textColor: textColorInvoice, fillColor: colorInvoice }
    });
    // Contenido de la tabla 2
    const tableData2 = [];
    const tableHeader = [
        { content: 'Producto', styles: { fillColor: colorInvoice } },
        { content: 'U.M.', styles: { fillColor: colorInvoice } },
        { content: 'Cantidad', styles: { fillColor: colorInvoice } },
        { content: 'Precio unitario (P.U)', styles: { fillColor: colorInvoice } },
        { content: 'Precio total (S/.)', styles: { fillColor: colorInvoice } }
    ];
    for (let i = 0; i < invoice.productsList.length; i++) {
        const product = invoice.productsList[i];
        tableData2.push([
            product.product,
            invoice.unitPiece,
            new Intl.NumberFormat('en-US').format(product.quantity),
            `S/ ${product.priceUnit.toFixed(2)}`,
            `S/ ${product.totalPrice.toFixed(2)}`
        ]);
    }

    // Ajustar la posición para la tabla 2
    const table2Y2 = table2Y + doc.autoTable.previous.finalY - 105;

    // Configurar la tabla 2
    doc.autoTable({
        startY: table2Y2,
        head: [tableHeader],
        body: tableData2,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        styles: {
            textColor: textColorInvoice
        }
    });

    // Información adicional
    const infoY = table2Y2 + doc.autoTable.previous.finalY - 15;


    const tableData21 = [
        [{ content: 'Peso Total:', styles: { fillColor: colorInvoice } }, `${invoice.totalWeight} Kg`],
        [{ content: 'Subtotal:', styles: { fillColor: colorInvoice } }, `S/ ${invoice.subtotal.toFixed(2)}`],
        [{ content: 'IGV (18%):', styles: { fillColor: colorInvoice } }, `S/ ${(invoice.subtotal * (18 / 100)).toFixed(2)}`],
        [{ content: 'Total Factura:', styles: { fillColor: colorInvoice } }, `S/ ${invoice.totalInvoice.toFixed(2)}`],
        [{ content: 'Total Fletes:', styles: { fillColor: colorInvoice } }, `S/ ${invoice.totalFletesPrice.toFixed(2)}`],
        [{ content: 'Total con Fletes:', styles: { fillColor: colorInvoice } }, `S/ ${invoice.totalWithFletes.toFixed(2)}`]
    ];

    doc.autoTable({
        startY: infoY,
        body: tableData21,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        margin: { left: 130 },
        styles: { fontStyle: 'bold', textColor: textColorInvoice }
    });
    return doc;
};

const handleDownloadPDFInvoice = (invoice) => {
  const doc = generatePDF(invoice);
  doc.save(`${invoice.invoiceCode}.pdf`);
};

export default handleDownloadPDFInvoice;
