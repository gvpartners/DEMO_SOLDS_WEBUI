import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generatePDF = (invoice) => {
    // Obtener la fecha de creación de la factura ajustada según la zona horaria
    const adjustedDate = new Date(invoice.createdOn);

    // Función para capitalizar la primera letra de una cadena
    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Formatear la fecha actual
    const formattedDate = adjustedDate.toLocaleDateString("es-PE", {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Calcular la fecha válida hasta un mes después de la fecha de creación
    const validUntilDate = new Date(adjustedDate);
    validUntilDate.setMonth(validUntilDate.getMonth() + 1);

    // Formatear la fecha válida hasta en el formato deseado
    const validUntilFormatted = validUntilDate.toLocaleDateString("es-PE", {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Capitalizar la primera letra de cada cadena
    const formattedDateCapitalized = capitalizeFirstLetter(formattedDate);
    const validUntilFormattedCapitalized = capitalizeFirstLetter(validUntilFormatted);

    const colorInvoice = [241, 206, 0];
    const textColorInvoice = [1, 53, 103];
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = `COTIZACIÓN BLOQUES UNICON / ${invoice.invoiceCode}`;
    const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2;
    doc.setTextColor(1, 53, 103);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, titleX, 15);
    const underlineX = titleX;
    doc.setDrawColor(0);
    doc.line(underlineX, 18, underlineX + titleWidth, 18);

    const logoX = 15;
    const logoY = 25;
    const imgData = '/assets/avatars/unicon.png';
    doc.addImage(imgData, 'PNG', logoX, logoY, 30, 30);

    // Calcular la posición inicial y el ancho de la tabla 1
    const table1X = logoX + 45;
    const table2Y = 15; // Move the declaration here to fix the undefined error

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
        styles: {
            fontStyle: 'bold',
            textColor: textColorInvoice,
            cellPadding: 0.5, // Ajusta este valor para reducir el espacio entre las filas
        },
    });
    const tablaDate = [
        [{ content: 'Fecha de elaboración:', styles: { fillColor: colorInvoice } }, `${formattedDateCapitalized}`],
        [{ content: 'Válido hasta:', styles: { fillColor: colorInvoice } }, `${validUntilFormattedCapitalized}`]
    ]
    doc.autoTable({
        startY: doc.autoTable.previous.finalY,
        body: tablaDate,
        theme: 'grid',
        tableLineWidth: 0,
        margin: { left: table1X },
        tableWidth: 'auto',
        showHeader: 'never',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        styles: {
            fontStyle: 'bold',
            textColor: textColorInvoice,
            cellPadding: 0.5,
        },
    });
    // Encabezados de la tabla 2
    const tableHeader11 = [
        { content: 'CLIENTE', styles: { fillColor: colorInvoice, fontSize: 10 } },
        { content: '', styles: { fillColor: colorInvoice } }
    ];
    const tableData11 = [
        [`Nombre:`, invoice.identificationInfo],
        [`Dirección:`, 'NO PROPORCIONADO'],
        [`${invoice.identificationType}:`, invoice.documentInfo],
        [`Correo electrónico:`, invoice.email || 'NO PROPORCIONADO'],
        [`Teléfono:`, invoice.telephone || 'NO PROPORCIONADO'],
    ];

    // Configurar la tabla 2
    doc.autoTable({
        startY: table2Y + 45,
        head: [tableHeader11],
        body: tableData11,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        styles: {
            textColor: textColorInvoice,
            cellPadding: 1,
        }
    });

    const tableHeader12 = [
        { content: 'MODALIDAD DE DESPACHO', styles: { fillColor: colorInvoice, fontSize: 10 } },
        { content: '', styles: { fillColor: colorInvoice } }
    ];
    const tableData12 = [
        [`Tipo de entrega:`, invoice.deliveryType],
        [`Distrito:`, invoice.selectedDistrict],
        [`Dirección:`, invoice.address],
        [`Referencia:`, invoice.reference || "NO PROPORCIONADO"]
    ];

    // Configurar la tabla 2
    doc.autoTable({
        startY: table2Y + 85,
        head: [tableHeader12],
        body: tableData12,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        styles: {
            textColor: textColorInvoice,
            cellPadding: 1,
        }
    });
    const details = [
        [`En atención a su requerimiento, tengo el agrado de enviarle la siguiente propuesta:`]
    ];

    doc.autoTable({
        startY: logoY + doc.autoTable.previous.finalY - 20,
        body: details,
        theme: 'plain',
        tableLineColor: [255, 255, 255],
        tableWidth: 'auto',
        tableLineWidth: 0, // Grosor de los bordes
        styles: { fontStyle: 'bold', fontSize: 10, textColor: textColorInvoice,cellPadding: 0.5, }
    });
    const tableData2 = [];
    const tableHeader = [
        { content: 'Producto', styles: { fillColor: colorInvoice, fontSize: 11 } },
        { content: 'U.M.', styles: { fillColor: colorInvoice, fontSize: 11 } },
        { content: 'Cantidad', styles: { fillColor: colorInvoice, fontSize: 11 } },
        { content: 'Precio Und.', styles: { fillColor: colorInvoice, fontSize: 11 } },
        { content: 'Totales', styles: { fillColor: colorInvoice, fontSize: 11 } }
    ];
    const formatter = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    });

    for (let i = 0; i < invoice.productsList.length; i++) {
        const product = invoice.productsList[i];
        tableData2.push([
            product.product,
            invoice.unitPiece,
            new Intl.NumberFormat('en-US').format(product.quantity),
            `S/ ${product.priceUnit.toFixed(2)}`,
            `${formatter.format(product.totalPrice)}`
        ]);
    }

    // Ajustar la posición para la tabla 2
    const table2Y2 = logoY + doc.autoTable.previous.finalY - 20;

    // Configurar la tabla 2
    doc.autoTable({
        startY: table2Y2,
        head: [tableHeader],
        body: tableData2,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        styles: {
            textColor: textColorInvoice,
            cellPadding: 1,
        }
    });

    // Información adicional
    const infoY = logoY + doc.autoTable.previous.finalY - 20;

    const tableData20 = [
        [{ content: 'Cantidad:', styles: { fillColor: colorInvoice } }, `${new Intl.NumberFormat('en-US').format(invoice.totalOfPieces)}`],
        [
            {
                content: 'Peso Total:',
                styles: { fillColor: colorInvoice },
            },
            `${invoice.totalWeight > 1000
                ? `${(invoice.totalWeight / 1000).toFixed(2)} TN`
                : `${invoice.totalWeight.toFixed(2)} KG`
            }`,
        ],
        [{ content: 'Número de Parihuelas:', styles: { fillColor: colorInvoice } }, `${invoice.cantParihuela}`],
    ];

    doc.autoTable({
        startY: infoY,
        body: tableData20,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        margin: { right: 130 },
        styles: { fontStyle: 'bold', textColor: textColorInvoice,cellPadding: 1}
    });

    const tableData21 = [
        [{ content: 'Subtotal:', styles: { fillColor: colorInvoice } }, `${formatter.format(invoice.subtotal.toFixed(2))}`],
        [{ content: 'IGV (18%):', styles: { fillColor: colorInvoice } }, `${formatter.format((invoice.subtotal * (18 / 100)).toFixed(2))}`],
        [{ content: 'Total:', styles: { fillColor: colorInvoice } }, `${formatter.format(invoice.totalInvoice.toFixed(2))}`]
    ];

    doc.autoTable({
        startY: infoY,
        body: tableData21,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        margin: { left: 130 },
        styles: { fontStyle: 'bold', textColor: textColorInvoice,cellPadding: 1}
    });

    // Ajuste de posición para la tabla 2
    doc.addPage();

    const tableInfo = [
        ["Cta cte nuevos soles BCP 193 - 0099308 - 0 -09"],
        ["Condiciones generales de venta"],
        ["Condiciones de entrega"],
        ["• Todos los pedidos se entregan a 72 horas de haber abonado"],
        ["• Puesto en obra: considera entrega en obra, hasta donde pueda ingresar la unidad de forma segura"],
        ["• Puesto en obra: incluye servicio de descarga a pie de camión"],
        ["• Puesto en obra: el cliente deberá advertir sobre problemas de acceso, restricciones de tamaño y horarios en obra"],
        ["• Puesto en obra: si el camión es devuelto a planta sin haber descargado, por los motivos antes señalados, se cargará un falso flete"],
        ["• Si tiene cambio de metrado, solicitar nueva cotización, ya que los precios varían según cantidad y flete a utilizar"],
        ["• Es importante cumplir los horarios dados, ya que si el camión tiene multas municipales, lo asumirá el cliente"],
        ["Condiciones de pago"],
        ["• Pago al contado: se realizará el pago en nuestra cuenta recaudadora (Scotiabank, BCP, Continental, Interbank)"],
        ["• Pago al contado: una vez emitida la factura o boleta se activará la deuda en el sistema del banco recaudador"],
        ["• Pago al contado: indicar que se desea pagar a la recaudación de UNICON y el código que le solicitarán en ventanilla del banco es su N° de RUC o DNI"],
        ["• Pago al contado: una vez realizado el pago, por favor enviar la confirmación vía email para liberar el pedido y programar el despacho"],
        ["• Pago al crédito: si Ud. ya cuenta con una evaluación o línea de crédito activa en UNICON"],
        ["• Pago al crédito: tendrá las mismas condiciones que tiene para la compra de concreto premezclado."],
        ["Otras condiciones"],
        ["• Pedido especial a producir y entrega en 30 a 45 días según OC enviada"],
        ["• No se aceptan cambios ni devoluciones"],
        ["• Los pedidos se entregarán con 72 horas de anticipación, a partir de la confirmación de pago, o línea de crédito disponible - activa"],
        ["• Cotización considera entrega en camión de 20 TN (verificar accesos para el tipo de unidad)"],
        ["• Devolución de parihuelas: el material de embalaje (parihuelas) no se encuentra incluido en el precio cotizado"],
        ["• No se deja parihuelas en obra - no se presta parihuelas"]
    ];

    doc.autoTable({
        startY: table2Y,
        body: tableInfo,
        theme: 'plain',
        tableLineColor: [255, 255, 255],
        tableLineWidth: 0,
        tableWidth: 'auto',
        showHeader: 'never',
        styles: { fontStyle: 'bold', textColor: textColorInvoice }
    });

    const tableSignature = [
        [invoice.employee?.toUpperCase()],
        ["Ejecutivo de ventas UN Bloques"],
        [invoice.employeePhone],
        [invoice.createdBy],
    ]

    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 10,
        body: tableSignature,
        theme: 'plain',
        tableLineColor: [255, 255, 255],
        tableLineWidth: 0,
        margin: { left: 15 },
        tableWidth: 'auto',
        showHeader: 'never',
        styles: {
            fontStyle: 'bold',
            textColor: textColorInvoice,
            cellPadding: 0.5,
            fontSize:12
        },
    });

    return doc;
};

const handleDownloadPDFInvoice = (invoice) => {
    const doc = generatePDF(invoice);
    doc.save(`${invoice.invoiceCode}.pdf`);
};

export default handleDownloadPDFInvoice;
