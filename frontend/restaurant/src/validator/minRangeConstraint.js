import { Constraint } from "./constraint";

export class MinRangeConstraint extends Constraint {
    constructor(name, value, min){
        super(name, value);
        this.min = min;
    }

    getMessage(){
        return `${this.name} debe ser mayor de ${this.min}.`;
    }

    validate(){
        return this.value > this.min;
    }


}
