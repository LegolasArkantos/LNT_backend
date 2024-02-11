const mongoose = require("mongoose");
const Poll = require('../Models/Poll.model');
const Teacher =require('../Models/Teacher.model');

const createPoll = async (req, res) => {
    const pollData = req.body.pollData;
    const profileID = req.user.profileID;

    if (!mongoose.Types.ObjectId.isValid(profileID)) {
        return res.status(404).json({ error: "invalid" });
    }

    try {
        const poll = new Poll(pollData);
        await poll.save();
        teacher = await Teacher.findById(profileID);
        teacher.polls.push(poll._id);
        await teacher.save();
        if (poll) {
            res.status(200).json({mssg: "Poll created successfully!"});
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getMyPolls = async (req, res) => {
    const profileID = req.user.profileID;

    if (!mongoose.Types.ObjectId.isValid(profileID)) {
        return res.status(404).json({ error: "invalid" });
    }

    try {
        const polls = await Teacher.findById(profileID).select('polls').populate('polls');
        if (!polls) {
            return res.status(404).json({mssg: "You have not created any polls"});
        }
        res.status(200).json(polls);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getAllPolls = async (req, res) => {
    try {
        const polls = await Poll.find();
        if (!polls) {
            return res.status(404).json({mssg: "no polls found"});
        }
        res.status(200).json(polls);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const deletePoll = async (req, res) => {
    pollID = req.params.pollID;
    const profileID = req.user.profileID;

    if (!mongoose.Types.ObjectId.isValid(profileID)) {
        return res.status(404).json({ error: "invalid" });
    }

    try {
        const result = await Poll.findByIdAndDelete(pollID);
        if (!result) {
            return res.status(404).json({mssg: "error deleting poll"});
        }
        teacher = await Teacher.findById(profileID);
        teacher.polls = teacher.polls.filter((poll) => poll._id.toString() !== pollID);
        await teacher.save();
        res.status(200).json({mssg: "poll deleted successfully!"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updatePollCount = async (req, res) => {
    const pollID = req.params.pollID;
    const optionID = req.body.optionID;
    let total = 0;

    const profileID = req.user.profileID;

    if (!mongoose.Types.ObjectId.isValid(profileID)) {
        return res.status(404).json({ error: "invalid" });
    }

    try {
        const poll = await Poll.findById(pollID);
        for (const option of poll.options) {
            if (option._id == optionID) { // Note: Using '==' for comparison to avoid type mismatch
                option.count += 1;
            }
            total += option.count;
        }

        // Ensure total is not zero to avoid division by zero
        if (total !== 0) {
            for (const option of poll.options) {
                option.percentage = (option.count / total) * 100;
            }
        }

        poll.users.push(profileID);

        await poll.save();
        res.status(200).json({ message: "Poll count updated successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


module.exports = {createPoll, getMyPolls, getAllPolls, deletePoll, updatePollCount};