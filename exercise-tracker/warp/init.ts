import { Exercise, ExerciseAdded, ExerciseTrackerService, User } from "./objects";
import { Init } from "warp-runtime";

export function onBoot(init: Init) {
    init.registerData(User);
    init.registerData(Exercise);
    init.registerService(ExerciseTrackerService);
    init.registerMessage(ExerciseAdded);
}