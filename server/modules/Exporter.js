const excel = require('node-excel-export');

module.exports = {
    toExcel: function (title, dataset, headers) {
        const styles = {
            headerDark: {
                fill: {
                    fgColor: {rgb: 'FF000000'}
                },
                font: {
                    color: {rgb: 'FFFFFFFF'},
                    sz: 12,
                    bold: true
                }
            }
        };

        const heading = [];
        if (headers) {
            headers.forEach(header => {
                heading.push({
                    value: typeof header === 'object' ? header.value : header,
                    style: styles.headerDark
                });
            });
        }

        const specifications = {};
        for (const key in dataset[0]){
            if(dataset[0].hasOwnProperty(key)) {
                const label = key.replace( /([A-Z])/g, " $1" );
                const finalLabel = label.charAt(0).toUpperCase() + label.slice(1);
                specifications[key] = {
                    displayName: finalLabel.toUpperCase(),
                    headerStyle: styles.headerDark,
                    width: finalLabel.length * 13 // increase multiplier based font size
                }
            }
        }

        return excel.buildExport([
                {
                    name: title,
                    specification: specifications,
                    data: dataset
                }
            ]
        );
    }
};