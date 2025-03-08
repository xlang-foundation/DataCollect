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


export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to read blob data"));
      }
    };

    reader.onerror = () => {
      reject(reader.error || new Error("Unknown error occurred"));
    };

    reader.readAsDataURL(blob);
  });
}

// // 示例用法
// const dataURL = await blobToDataURL(blob);
// console.log(dataURL);

// // 使用Promise链式调用
// blobToDataURL(blob)
//   .then(dataURL => console.log(dataURL))
//   .catch(error => console.error(error));
