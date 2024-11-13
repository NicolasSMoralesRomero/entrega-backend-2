import * as url from 'url';


const config = {
    PORT: 8080,
    DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
   
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/uploads` },
    
    MONGODB_URI: 'mongodb+srv://nicomorales:C0hsHN0Of0oXC5aq@cluster0.rqnge.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    SECRET: 'coder70190secret'
};

export default config;
