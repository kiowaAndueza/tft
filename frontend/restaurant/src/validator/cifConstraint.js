import { Constraint } from "./constraint";

export class CifConstraint extends Constraint {
    
    getMessage() {
        return `Formato válido: Una letra mayúscula seguida de siete dígitos y terminando con una letra mayúscula de la A a la J o un dígito numérico.`;
    }

    validate() {
        const cifRegex = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
        return cifRegex.test(this.value);
    }
}
