import { Constraint } from "./constraint";

export class MaxCharactersConstraint extends Constraint{
    constructor(name, value, max){
        super(name, value);
        this.max = max;
    }

    getMessage(){
        return `${this.name} debe tener como máximo ${this.max} caracteres.`;
    }

    validate(){
        return String(this.value).length <= this.max;
    }
    
}