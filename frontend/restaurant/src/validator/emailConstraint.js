import { Constraint } from "./constraint";

export class EmailConstraint extends Constraint {
    getMessage(){
        return 'El correo electrónico debe tener un formato válido.';
    }


    validate(){
        const regexEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        return regexEmail.test(this.value);
    }
}
