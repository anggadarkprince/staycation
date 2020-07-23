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

        const heading = headers || [];
        if (!headers) {
            for (const key in dataset[0]) {
                heading.push(key);
            }
        }

        const specifications = {};
        if (dataset.length) {
            heading.forEach(key => {
                const label = key.replace(/([A-Z])/g, " $1");
                const finalLabel = label.charAt(0).toUpperCase() + label.slice(1);
                specifications[key] = {
                    displayName: finalLabel.toUpperCase(),
                    headerStyle: styles.headerDark,
                    width: finalLabel.length * 13 // increase multiplier based font size
                }
            });
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