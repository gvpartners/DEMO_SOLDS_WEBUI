import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { fontSize } from '@mui/system';

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

    //Elegir el mayor carro
    var truck;
    if (invoice.truck9TN > invoice.truck20TN && invoice.truck9TN > invoice.truck32TN) {
        truck = '9 TN';
    } else if (invoice.truck20TN > invoice.truck9TN && invoice.truck20TN > invoice.truck32TN) {
        truck = "20 TN";
    } else {
        truck = '32 TN';
    }
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
        showHead: 'never',
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
        showHead: 'never',
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
        [`Nombre:`, invoice.identificationInfo || 'NO PROPORCIONADO'],
        [`Dirección:`, invoice.customerAddress?.toUpperCase() || 'NO PROPORCIONADO'],
        [`${invoice.identificationType || 'RUC'}:`, invoice.documentInfo || 'NO PROPORCIONADO'],
        [`Contacto:`, invoice.contact || 'NO PROPORCIONADO'],
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
        },
        columnStyles: {
            0: { cellWidth: 40 }, // Establecer el ancho de la primera columna a 30px
        },
    });

    const tableHeader12 = [
        { content: 'MODALIDAD DE DESPACHO', styles: { fillColor: colorInvoice, fontSize: 10 } },
        { content: '', styles: { fillColor: colorInvoice } }
    ];
    const tableData12 = [
        [`Tipo de entrega:`, invoice.deliveryType],
        [`Distrito:`, invoice.selectedDistrict],
        [`Dirección:`, invoice.address?.toUpperCase()],
        [`Referencia:`, invoice.reference || "NO PROPORCIONADO"]
    ];

    // Configurar la tabla 2
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 5,
        head: [tableHeader12],
        body: tableData12,
        theme: 'grid',
        tableLineColor: [0, 0, 0], // Bordes negros
        tableLineWidth: 0.2, // Grosor de los bordes
        styles: {
            textColor: textColorInvoice,
            cellPadding: 1,
        },
        columnStyles: {
            0: { cellWidth: 50 }, // Establecer el ancho de la primera columna a 30px
        },
    });
    const details = [
        [`En atención a su requerimiento, tengo el agrado de enviarle la siguiente propuesta:`]
    ];

    doc.autoTable({
        startY: logoY + doc.autoTable.previous.finalY - 20,
        head: [],
        body: details,
        theme: 'plain',
        tableLineColor: [255, 255, 255],
        tableWidth: 'auto',
        tableLineWidth: 0, // Grosor de los bordes
        styles: { fontStyle: 'bold', fontSize: 10, textColor: textColorInvoice, cellPadding: 0.5, }
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
        styles: { fontStyle: 'bold', textColor: textColorInvoice, cellPadding: 1 }
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
        styles: { fontStyle: 'bold', textColor: textColorInvoice, cellPadding: 1 }
    });

    // Ajuste de posición para la tabla 2
    doc.addPage();
    if (invoice.deliveryType != "ENTREGADO EN PLANTA") {
        const tablePuestoEnObra = [
            { content: 'CONDICIONES GENERALES DE VENTA ', styles: { fillColor: colorInvoice, fontSize: 12 } },
            { content: '', styles: { fillColor: colorInvoice } }
        ];

        doc.autoTable({
            startY: 10,
            head: [tablePuestoEnObra],
            theme: 'grid',
            tableLineColor: [0, 0, 0], // Bordes negros
            tableLineWidth: 0.2, // Grosor de los bordes
            styles: {
                textColor: textColorInvoice,
                cellPadding: 1,
            }
        });
        const tablePuestoEnObra2 = [
            { content: 'CONDICIONES DE ENTREGA ', styles: { fillColor: [255, 255, 255], fontSize: 11 } },
            { content: '', styles: { fillColor: [255, 255, 255] } }
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 3,
            head: [tablePuestoEnObra2],
            theme: 'grid',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0.2, // Grosor de los bordes
            styles: {
                textColor: textColorInvoice,
                cellPadding: 1,
            }
        });

        const tableInfo = [
            ["1. Los pedidos se entregarán con 72 horas de anticipación, a partir de la confirmación de pago, o línea de crédito disponible y activa."],
            ["2. Puesto en obra: Considera entrega en obra, hasta donde pueda ingresar la unidad de forma segura."],
            ["3. Puesto en obra: Incluye el servicio de descarga MANUAL con estibadores a pie de camión."],
            ["4. Puesto en obra: El cliente deberá advertir sobre problemas de acceso, restricciones de tamaño y horarios en obra."],
            ["5. Puesto en obra: Si el camión es devuelto a planta sin haber descargado, por los motivos antes señalados, se cargará un falso flete, según el tipo de camión (Tn) y distrito."],
            ["6. Puesto en obra: Es importante cumplir los horarios programados. Por restricciones de horarios en distritos, si hubiera multas municipales sobre el transporte, lo asumirá el cliente."],
            ["7. NO se aceptan cambios ni devoluciones. Por restricciones de horarios, por multas municipales sobre el transporte, por tiempo de espera en obra (horas), lo asumirá cliente."],
        ];
        const tableInfoAux = [
            ["1. Los pedidos se entregarán con 72 horas de anticipación, a partir de la confirmación de pago, o línea de crédito disponible y activa."],
            ["2. Puesto en obra: Considera entrega en obra, hasta donde pueda ingresar la unidad de forma segura."],
            ["3. Puesto en Obra: Cotización incluye costo de productos entregados sobre parihuelas."],
            ["4. Puesto en Obra: El cliente es responsable de la descarga con sus equipos mecánicos (Grúas o Montacargas)."],
            ["5. Puesto en obra: El cliente deberá advertir sobre problemas de acceso, restricciones de tamaño y horarios en obra."],
            ["6. Puesto en obra: Si el camión es devuelto a planta sin haber descargado, por los motivos antes señalados, se cargará un falso flete, según el tipo de camión (Tn) y distrito."],
            ["7. Puesto en obra: Es importante cumplir los horarios programados. Por restricciones de horarios en distritos, si hubiera multas municipales sobre el transporte, lo asumirá el cliente."],
            ["8. NO se aceptan cambios ni devoluciones. Por restricciones de horarios, por multas municipales sobre el transporte, por tiempo de espera en obra (horas), lo asumirá cliente."],
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY,
            body: invoice.isParihuelaNeeded == "No" ? tableInfo : tableInfoAux,
            theme: 'plain',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,
            tableWidth: 'auto',
            showHead: 'never',
            styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 1 }
        });


        /////////////////
        const tablePuestoEnObra3 = [
            { content: 'CONDICIONES DE PAGO', styles: { fillColor: [255, 255, 255], fontSize: 11 } },
            { content: '', styles: { fillColor: [255, 255, 255] } }
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 3,
            head: [tablePuestoEnObra3],
            theme: 'grid',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0.2, // Grosor de los bordes
            styles: {
                textColor: textColorInvoice,
                cellPadding: 1,
            }
        });

        const tableInfo2 = [
            ["1. Pago al Contado: Una vez emitida la factura o boleta, se activará la deuda en el sistema del banco recaudador."],
            ["2. Pago al contado: Se realizará el pago en nuestra Cuenta Recaudadora (SCOTIABANK, BCP, CONTINENTAL, INTERBANK)."],
            ["3. Pago al Contado: Para pagos presenciales dirigirse al Banco seleccionado e Indicar que desea pagar a la Cta. recaudadora de UNICON, el código será su # RUC o DNI"],
            ["4. Pago al Contado: Para pagos a través del APP de su Banco, buscar: Pago por Servicios/UNICON/su # RUC/Seleccionar el documento de venta por pagar/Pagar/Enviar la constancia del pago."]
        ];


        doc.autoTable({
            startY: doc.autoTable.previous.finalY,
            body: tableInfo2,
            theme: 'plain',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,
            tableWidth: 'auto',
            showHead: 'never',
            styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 1 }
        });
        //////////
        // const tableInfo6 = [
        //     ["• Ingrese al banco //pago transferencias //pago de servicios //empresas diversas //UNICON."],
        //     ["• Cta BCP 193 - 0099308 - 0 - 09 (Unión de Concreteras S.A)"]
        // ];


        // doc.autoTable({
        //     startY: doc.autoTable.previous.finalY,
        //     body: tableInfo6,
        //     theme: 'plain',
        //     margin: { left: 20 },
        //     tableLineColor: [255, 255, 255],
        //     tableLineWidth: 0,
        //     tableWidth: 'auto',
        //     showHead: 'never',
        //     styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 1 }
        // });
        ///////////////
        const tableInfo7 = [
            ["5. Pago al Contado: Cta Cte BCP 193-0099308-0-09 (Unión de Concreteras S.A)"],
            ["6. Pago al Crédito: Si Ud. ya cuenta con una evaluación o línea de crédito activa en UNICON, tendrá las mismas condiciones que tiene para la compra de concreto premezclado."]
        ];


        doc.autoTable({
            startY: doc.autoTable.previous.finalY,
            body: tableInfo7,
            theme: 'plain',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,
            tableWidth: 'auto',
            showHead: 'never',
            styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 1 }
        });
        /////////////////////
        const tablePuestoEnObra4 = [
            { content: 'OTRAS CONDICIONES', styles: { fillColor: [255, 255, 255], fontSize: 11 } },
            { content: '', styles: { fillColor: [255, 255, 255] } }
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 3,
            head: [tablePuestoEnObra4],
            theme: 'grid',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0.2, // Grosor de los bordes
            styles: {
                textColor: textColorInvoice,
                cellPadding: 1,
            }
        });

        const tableInfo3 = [
            ["1. Cambios de Condiciones: Cualquier cambio de cantidades, medidas o colores invalida la presente cotización y se deberá solicitar una nueva, tomando en cuenta las nuevas condiciones."],
            ["2. Pedidos Especiales: Estos pedidos ingresan a programa de producción y se entregan entre 30 - 40 días de confirmada la compra."],
            [`3. Cotización considera entrega en camión de ${truck} (verificar accesos para el tipo de unidad).`],
            ["4. Devolución de parihuelas: el material de embalaje (parihuelas) no se encuentra incluido en el precio cotizado."],
            ["5. No se dejan ni se prestan parihuelas en obra."]
        ];
        const tableInfo3Aux = [
            ["1. Cambios de Condiciones: Cualquier cambio de cantidades, medidas o colores invalida la presente cotización y se deberá solicitar una nueva, tomando en cuenta las nuevas condiciones."],
            ["2. Pedidos Especiales: Estos pedidos ingresan a programa de producción y se entregan entre 30 - 40 días de confirmada la compra."],
            [`3. Cotización considera entrega en camión de ${truck} (verificar accesos para el tipo de unidad).`],
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY,
            body: invoice.isParihuelaNeeded == "No" ? tableInfo3 : tableInfo3Aux,
            theme: 'plain',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,
            tableWidth: 'auto',
            showHead: 'never',
            styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 1 }
        });
        /////////////////////
        const tablePuestoEnObra5 = [
            { content: 'CONDICIONES ESPECIALES DE DESCARGA', styles: { fillColor: [255, 255, 255], fontSize: 11 } },
            { content: '', styles: { fillColor: [255, 255, 255] } }
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 3,
            head: [tablePuestoEnObra5],
            theme: 'grid',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0.2, // Grosor de los bordes
            styles: {
                textColor: textColorInvoice,
                cellPadding: 1,
            }
        });

        const tableInfo4 = [
            ["1. Descarga mecánica: Si el cliente desea usar sus equipos mecánicos para la descarga (grúas, montacargas, otros), se deberá comunicar con el Ejecutivo de Ventas antes de iniciar las entregas para coordinar la entrega de parihuelas."],
            ["2. Descarga mecánica: El cliente puede entregar un lote de parihuelas en nuestra planta ubicada en Jr. Plácido Jiménez # 790, Cercado de Lima. Nosotros nos ocupamos de acondicionar los productos."],
            ["3. Descarga mecánica: El cliente puede tener un lote de parihuelas en obra y nosotros nos encargamos de hacer la descarga sobre las parihuelas."],
            [""],
            ["En espera de sus gratas noticias, lo saludamos."],
            ["Cordialmente."],
        ];
        const tableInfo4Aux = [
            ["1. Descarga mecánica: Si el cliente desea usar sus equipos mecánicos para la descarga (grúas, montacargas, otros), se deberá comunicar con el Ejecutivo de Ventas antes de iniciar las entregas para coordinar la entrega de parihuelas."],
            [""],
            ["En espera de sus gratas noticias, lo saludamos."],
            ["Cordialmente."],
        ];
        doc.autoTable({
            startY: doc.autoTable.previous.finalY,
            body: invoice.isParihuelaNeeded == "No" ? tableInfo4 : tableInfo4Aux,
            theme: 'plain',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,
            tableWidth: 'auto',
            showHead: 'never',
            styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 0.6 }
        });
    }
    else {
        const tablePuestoEnPlanta = [
            { content: 'CONDICIONES GENERALES DE VENTA ', styles: { fillColor: colorInvoice, fontSize: 12 } },
            { content: '', styles: { fillColor: colorInvoice } }
        ];

        doc.autoTable({
            startY: 10,
            head: [tablePuestoEnPlanta],
            theme: 'grid',
            tableLineColor: [0, 0, 0], // Bordes negros
            tableLineWidth: 0.2, // Grosor de los bordes
            styles: {
                textColor: textColorInvoice,
                cellPadding: 1,
            }
        });
        const tablePuestoEnPlanta2 = [
            { content: 'CONDICIONES DE ENTREGA ', styles: { fillColor: [255, 255, 255], fontSize: 11 } },
            { content: '', styles: { fillColor: [255, 255, 255] } }
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 3,
            head: [tablePuestoEnPlanta2],
            theme: 'grid',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0.2, // Grosor de los bordes
            styles: {
                textColor: textColorInvoice,
                cellPadding: 1,
            }
        });


        const tableInfo = [
            ["1. Los pedidos se entregarán con 72 horas de anticipación, a partir de la confirmación de pago, o línea de crédito disponible y activa."],
            ["2. Recojo en planta: Horario de atención de lunes a viernes de 8:00 AM a 5:00 PM, sábado hasta medio día."],
            ["3. Recojo en planta: Horario de refrigerio de lunes a viernes de 12:00 PM a 1:00 PM"],
            ["4. Recojo en planta: Chofer y estibadores deberán de contar con seguro SCTR, EPPS y DNI."],
            ["5. Recojo en planta: El Cliente deberá de contar con Guía de Remisión de Cliente y Transportista."],
            ["6. NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES"],
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY,
            body: tableInfo,
            theme: 'plain',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,
            tableWidth: 'auto',
            showHead: 'never',
            styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 1 }
        });


        /////////////////
        const tablePuestoEnPlanta3 = [
            { content: 'CONDICIONES DE PAGO', styles: { fillColor: [255, 255, 255], fontSize: 11 } },
            { content: '', styles: { fillColor: [255, 255, 255] } }
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 3,
            head: [tablePuestoEnPlanta3],
            theme: 'grid',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0.2, // Grosor de los bordes
            styles: {
                textColor: textColorInvoice,
                cellPadding: 1,
            }
        });

        const tableInfo2 = [
            ["1. Pago al Contado: Una vez emitida la factura o boleta, se activará la deuda en el sistema del banco recaudador."],
            ["2. Pago al contado: Se realizará el pago en nuestra Cuenta Recaudadora (SCOTIABANK, BCP, CONTINENTAL, INTERBANK)."],
            ["3. Pago al Contado: Para pagos presenciales dirigirse al Banco seleccionado e Indicar que desea pagar a la Cta. recaudadora de UNICON, el código será su # RUC o DNI"],
            ["4. Pago al Contado: Para pagos a través del APP de su Banco, buscar: Pago por Servicios/UNICON/su # RUC/Seleccionar el documento de venta por pagar/Pagar/Enviar la constancia del pago."]
        ];


        doc.autoTable({
            startY: doc.autoTable.previous.finalY,
            body: tableInfo2,
            theme: 'plain',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,
            tableWidth: 'auto',
            showHead: 'never',
            styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 1 }
        });
        // //////////
        // const tableInfo6 = [
        //     ["• Ingrese al banco //pago transferencias //pago de servicios //empresas diversas //UNICON."],
        //     ["• Cta BCP 193 - 0099308 - 0 - 09 (Unión de Concreteras S.A)"]
        // ];


        // doc.autoTable({
        //     startY: doc.autoTable.previous.finalY,
        //     body: tableInfo6,
        //     theme: 'plain',
        //     margin: { left: 20 },
        //     tableLineColor: [255, 255, 255],
        //     tableLineWidth: 0,
        //     tableWidth: 'auto',
        //     showHead: 'never',
        //     styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 1 }
        // });
        ///////////////
        const tableInfo7 = [
            ["5. Pago al Contado: Cta Cte BCP 193-0099308-0-09 (Unión de Concreteras S.A)"],
            ["6. Pago al Crédito: Si Ud. ya cuenta con una evaluación o línea de crédito activa en UNICON, tendrá las mismas condiciones que tiene para la compra de concreto premezclado."]
        ];


        doc.autoTable({
            startY: doc.autoTable.previous.finalY,
            body: tableInfo7,
            theme: 'plain',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,
            tableWidth: 'auto',
            showHead: 'never',
            styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 1 }
        });
        /////////////////////
        const tablePuestoEnPlanta4 = [
            { content: 'OTRAS CONDICIONES', styles: { fillColor: [255, 255, 255], fontSize: 11 } },
            { content: '', styles: { fillColor: [255, 255, 255] } }
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 3,
            head: [tablePuestoEnPlanta4],
            theme: 'grid',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0.2, // Grosor de los bordes
            styles: {
                textColor: textColorInvoice,
                cellPadding: 1,
            }
        });

        const tableInfoOtrasCondiciones = [
            ["1. Los PEDIDOS ESPECIALES se deben producir y se entrega de 30 a 45 días según OC enviada."],
            ["2. No se entrega productos en parihuelas, deben contar con estibadores para su carguío a granel."],
            ["3. No se presta parihuelas."],
            [""],
            ["En espera de sus gratas noticias, lo saludamos."],
            ["Cordialmente."],
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY,
            body: tableInfoOtrasCondiciones,
            theme: 'plain',
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,
            tableWidth: 'auto',
            showHead: 'never',
            styles: { fontStyle: 'bold', textColor: [0, 0, 0], cellPadding: 1 }
        });

    }

    const tableSignature = [
        [invoice.employee?.toUpperCase()],
        ["Ejecutivo de ventas UN Bloques"],
        [invoice.employeePhone],
        [invoice.createdBy],
    ]

    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 2,
        body: tableSignature,
        theme: 'plain',
        tableLineColor: [255, 255, 255],
        tableLineWidth: 0,
        margin: { left: 14 },
        tableWidth: 'auto',
        showHead: 'never',
        styles: {
            fontStyle: 'bold',
            textColor: [0, 0, 0],
            cellPadding: 0,
            fontSize: 10
        },
    });

    return doc;
};

const PDFPreview = (invoice) => {
    const doc = generatePDF(invoice);
    const blob = doc.output('blob');
    const blobURL = URL.createObjectURL(blob);

    const openWindow = window.open('', '_blank');
    openWindow.document.write(`<iframe width='100%' height='100%' src='${blobURL}'></iframe>`);
};

export default PDFPreview;
