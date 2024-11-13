import userModel from './models/user.model.js';
import { createHash, isValidPassword } from '../utils.js';



class userManager {
    constructor() {}

    get = async () => {
        try {
            return await userModel.find().lean();
        } catch (err) {
            return null;
        }
    }

    getOne = async (filter) => {
        try {
            return await userModel.findOne(filter).lean();
        } catch (err) {
            return err.message;
        };
    };


    add = async (data) => {
        try {
            return await(userModel.create(data));
        } catch (err) {
            return null;
        }
    }

    update = async (filter, update, options) => {
        try {
            return await userModel.findOneAndUpdate(filter, update, options);
        } catch (err) {
            return null;
        }
    }

    delete = async (filter, options) => {
        try {
            return await userModel.findOneAndDelete(filter, options);
        } catch (err) {
            return null;
        }
    }

    authenticate = async (user, pass) => {
        try {
            const filter = { email: user };
            const foundUser = await userModel.findOne(filter).lean();
            
            if (foundUser && isValidPassword(pass, foundUser.password)) {
                const { password, ...filteredUser } = foundUser;

                return filteredUser;
            } else {
                return null;
            }
        } catch (err) {
            return err.message;
        }
    }

    register = async (data) => {
        try {
            const filter = { email: data.username };
            const user = await userModel.findOne(filter).lean();

            if (!user) { // No hay usuario con ese email, procedemos a registrar
                data.password = createHash(data.password)
                return await this.add(data);
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }
}


export default userManager;
