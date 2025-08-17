const isRecruiter = (req, res, next) => {
  if (req.user.role !== "RECRUITER") {
    return res.status(403).json({ error: "Access denied: Recruiter only" });
  }
  next();
};

const isApplicant = (req, res, next) => {
  if (req.user.role !== "APPLICANT") {
    return res.status(403).json({ error: "Access denied: Applicant only" });
  }
  next();
};

export {isApplicant, isRecruiter}