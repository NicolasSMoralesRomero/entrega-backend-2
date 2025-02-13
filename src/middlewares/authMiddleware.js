export function authorizeRole(requiredRole) {
    return (req, res, next) => {

        if (!req.user) {
            console.log("Acceso denegado: usuario no autenticado");
            return res.status(401).json({ message: "No autenticado" });
        }

        if (req.user.role !== requiredRole) {
            console.log(`Acceso denegado: se requiere rol ${requiredRole}, pero el usuario es ${req.user.role}`);
            return res.status(403).json({ message: "Acceso denegado" });
        }

        console.log("Acceso autorizado");
        next();
    };
}