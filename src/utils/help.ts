  
  /**
   * 将文件转换为 Base64 字符串
   * @param file 需要转换的 File 对象
   * @returns Promise<string> 返回包含 Base64 数据的字符串
   */
  export const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
