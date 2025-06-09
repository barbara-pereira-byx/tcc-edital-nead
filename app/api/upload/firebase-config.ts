// Configuração do Firebase para o ambiente de servidor
// Este arquivo é usado apenas pela API de upload

// Mock do Firebase Storage para evitar erros
const storage = {
  ref: (path: string) => ({
    put: () => Promise.resolve({
      ref: {
        getDownloadURL: () => Promise.resolve("/uploads/mock-file.pdf")
      }
    }),
    getDownloadURL: () => Promise.resolve("/uploads/mock-file.pdf"),
    getBytes: () => Promise.resolve(new Uint8Array())
  })
};

export { storage };
export default {};