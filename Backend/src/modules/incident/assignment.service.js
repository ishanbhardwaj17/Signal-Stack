import User from "../auth/user.model.js";

export const autoAssignIncident = async (incident) => {
    let role = null;

    switch (incident.severity) {
        case "CRITICAL":
            role = "SENIOR_ENGINEER";
            break;

        case "HIGH":
            role = "ENGINEER";
            break;

        default:
            return null;
    }

    const user = await User.findOne({
        role: { $in: [role, role.toLowerCase()] },
    });

    if (!user) {
        return null;
    }

    incident.assignedTo = user._id;

    incident.timeline.push({
        action: "AUTO_ASSIGNED",
        current: user.name,
        changedBy: user._id,
        timestamp: new Date(),
    });

    await incident.save();

    return user;
};