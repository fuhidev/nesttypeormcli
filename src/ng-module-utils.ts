const tokenizer = (st: string) => {
  let start = 0;
  let pos = 0;
  const arr = [];
  while (pos != st.length) {
    if (st[pos] == ",") {
      while (st[pos] != "\n" && pos != st.length) {
        pos++;
      }

      arr.push(st.substring(start, pos));
      start = pos;
    }
    pos++;
  }

  if (start != pos) {
    arr.push(st.substring(start, pos));
  }

  return arr.filter(x => x.trim().length > 0);
}

const addToType = (data: string, type: string, str: string) => {
  const stInx = data.indexOf(`@Module(`);
  const typeIndex = data.indexOf(type, stInx);

  if (typeIndex == -1) {
    const startIndex = data.lastIndexOf("]");
    const tmpl = `
   ${type}: [
    "${str}"
  ]`;

    return data.substring(0, startIndex + 1) + "," + tmpl + data.substring(startIndex + 1, data.length);
  }

  const startIndex = data.indexOf("[", typeIndex);
  const newString =  data.substring(0,startIndex + 1) + str + "," + data.substring(startIndex+1,data.length)
  return newString;
}

const addToImport = (data: string, str: string) => {
  const lastImportInx = data.lastIndexOf('import ');
  const lastImportEndInx = data.indexOf('from', lastImportInx);
  const endOfLastImportInx = data.indexOf('\n', lastImportEndInx);
  const fileLength = data.length;
  return data.substring(0, endOfLastImportInx) + `\n${str}` + data.substring(endOfLastImportInx, fileLength);
}

export {
  addToType,
  addToImport
};
