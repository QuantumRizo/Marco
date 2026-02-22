

/**
 * Checks if a given appointment date and time have already passed
 * evaluated against the 'America/Mexico_City' timezone perfectly.
 */
export const isAppointmentPast = (date: string, time: string): boolean => {
    try {
        if (!date || !time) return false;

        // Current time in Mexico
        const mxTimeString = new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" });
        const nowMx = new Date(mxTimeString);

        // Appointment DateTime
        const aptDateTime = new Date(`${date}T${time}:00`);

        // If the appointment DateTime is strictly less than 'now', it has passed
        return aptDateTime < nowMx;
    } catch (e) {
        console.error("Error validating past appointment", e);
        return false;
    }
};
