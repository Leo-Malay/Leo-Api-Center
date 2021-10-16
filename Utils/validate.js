const isValidPost = (ref, req) => {
    err = [];
    ref.map((ele) => {
        if (!req.body[ele]) {
            err.push(ele);
        } else {
            req.body[ele] = req.body[ele].trim();
            if (!req.body[ele]) {
                err.push(ele);
            }
        }
    });
    return err;
};

export default isValidPost;
