import { Constraint } from "./constraint";

export class UsernameConstraint extends Constraint {
    getMessage(){
        return 'El nombre de usuario debe tener el  "@" delante preseguido de 3-15 caracteres alfanuméricos';
    }


    validate(){
        const regexUsername = /^@[a-zA-Z0-9_]{3,15}$/;
        return regexUsername.test(this.value);
    }
}