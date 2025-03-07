export function dataURLtoBlob(dataURL: string) {
  // 从DataURL中提取文件类型
  var mimeType = dataURL.split(',')[0].split(':')[1].split(';')[0];

  // 将Base64编码的文件数据解码为ArrayBuffer
  var byteString = atob(dataURL.split(',')[1]);
  var arrayBuffer = new ArrayBuffer(byteString.length);
  var uint8Array = new Uint8Array(arrayBuffer);
  for (var i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  // 将ArrayBuffer转换为Blob对象
  return new Blob([uint8Array], { type: mimeType });
}

// // 示例用法
// var dataURL = "data:image/png;base64,iVBORw0KGg...";
// var blob = dataURLtoBlob(dataURL);
// console.log(blob);


export function blobToDataURL(blob:Blob, callback: (dataURL: any) => void) {
  var reader = new FileReader();
  reader.onload = function(e) {
    callback(e.target?.result);
  };
  reader.readAsDataURL(blob);
}

// // 示例用法
// var blob = new Blob(["Hello, world!"], { type: "text/plain" });
// blobToDataURL(blob, function(dataURL) {
//   console.log(dataURL);
// });
