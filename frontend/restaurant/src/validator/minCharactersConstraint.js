import { Constraint } from "./constraint";

export class MinCharactersConstraint extends Constraint{
    constructor(name, value, min){
        super(name, value);
        this.min = min;
    }

    getMessage(){
        if (this.min === 1){
            return `${this.name} no puede estar vacío.`;
        }
        return `${this.name} debe tener como mínimo ${this.min} caracteres.`;
    }

    validate(){
        return String(this.value).length >= this.min;
    }
    
}