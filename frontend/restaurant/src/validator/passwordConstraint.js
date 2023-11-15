import { Constraint } from "./constraint";

export class PasswordConstraint extends Constraint {
    getMessage(){
        return 'La contraseña debe tener al menos: una mayúscula, una minúscula, un dígito y de 8-25 caracteres.';
    }


    validate(){
        const regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,25}$/;        ;
        return regexPassword.test(this.value);
    }
}