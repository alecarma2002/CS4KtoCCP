var XLSX = nw.require("xlsx");

export function Excel(path,loopUnits){
    
    const worksheet = XLSX.utils.json_to_sheet(loopUnits);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Loop Units');

    XLSX.writeFile(workbook, path);
    
}