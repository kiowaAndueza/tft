import { Constraint } from "./constraint";

export class PhoneConstraint extends Constraint {
    getMessage(){
        return 'El teléfono debe tener un formato válido. Ejemp: 6xxxxxxxx';
    }

    validate(){
        const regexMovil = /^[67]\d{8}$/;
        return regexMovil.test(this.value);
    }
}
