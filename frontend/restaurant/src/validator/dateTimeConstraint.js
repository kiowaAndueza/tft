import { Constraint } from "./constraint";

export class DateTimeConstraint extends Constraint {
  getMessage() {
    const currentDateTime = new Date();
    const selectedDateTime = new Date(this.value);

    const timeDifferenceMinutes = (selectedDateTime - currentDateTime) / 60000;

    if (timeDifferenceMinutes < 60) {
      return "La reserva debe hacerse con al menos 1 hora de antelación.";
    } else if (timeDifferenceMinutes > 30 * 24 * 60) {
      return "La reserva no puede realizarse con más de 30 días de antelación.";
    }
    return;
  }

  validate() {
    const currentDateTime = new Date();
    const selectedDateTime = new Date(this.value);

    const timeDifferenceMinutes = (selectedDateTime - currentDateTime) / 60000;

    if (
      timeDifferenceMinutes >= 60 &&
      timeDifferenceMinutes <= 30 * 24 * 60 
    ) {
      return true;
    }

    return false;
  }
}

