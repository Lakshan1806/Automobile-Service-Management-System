import WorkRequest from "../models/WorkRequest.js";
import TechnicianWork from "../models/TechnicianWork.js";

// Get all assigned works for technician
export const getAssignedWorks = async (req, res) => {
  try {
    const { technicianId } = req.query;
    const works = await WorkRequest.find({ assignedTo: technicianId });
    res.json(works);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Start work
export const startWork = async (req, res) => {
  try {
    const { technicianId, workRequestId, selectedServices, selectedParts } =
      req.body;

    const newWork = new TechnicianWork({
      technicianId,
      workRequestId,
      selectedServices,
      selectedParts,
      progressUpdates: selectedServices.map((s) => ({ serviceId: s })),
    });

    await newWork.save();
    await WorkRequest.findByIdAndUpdate(workRequestId, {
      status: "in-progress",
    });

    res.status(201).json(newWork);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update progress
export const updateProgress = async (req, res) => {
  try {
    const { workId, serviceId, status } = req.body;
    const work = await TechnicianWork.findById(workId);

    const updateIndex = work.progressUpdates.findIndex(
      (u) => u.serviceId.toString() === serviceId
    );
    if (updateIndex !== -1) {
      work.progressUpdates[updateIndex].status = status;
      work.progressUpdates[updateIndex].updatedAt = new Date();
    }

    await work.save();
    res.json(work);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Finish work
export const finishWork = async (req, res) => {
  try {
    const { workId } = req.body;
    const work = await TechnicianWork.findByIdAndUpdate(
      workId,
      { finished: true, completedAt: new Date() },
      { new: true }
    );

    await WorkRequest.findByIdAndUpdate(work.workRequestId, {
      status: "completed",
    });

    res.json(work);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
