import {UpgradeProps, UpgradeType} from "./Upgrade";

export default class UpgradeDefaults {
    static getDefaults(): UpgradeProps[] {
        return [
            {
                title: "Capture",
                description: "At its most basic level, the Hacking Device gives its user the CPU clock cycles necessary to attempt a data penetration of target computer systems before triggering any intrusion counter-measures or alarms. At advanced levels of operation, the augmentation facilitates direct interface with other electronic security and tactical devices.\n" +
                    "Implanted in the cranium, the MHD-995 Hacking Device is a dedicated microcomputer module featuring a series of processors and databases, programmed with multiple code-breaking and counter-cryptography subroutines. When deployed, the hacking device provides immediate assistance to any user attempting to bypass, shut down or otherwise override electronic systems via a standard terminal interface. The unit is capable of identifying and providing I-War intrusion solutions for over fifteen million discrete software barriers.",
                levelDescriptions: [
                    "At its most basic level, the MHD- 995 Hacking Device provides its user with the enhanced ability to override Level 1 terminals and security camera systems.",
                    "With some familiarity, users of the MHD-995 Hacking Device can discover increased competence in overriding electronic systems, enabling them to take on Level 2 terminals.",
                    "Experienced users of the MHD-995 Hacking Device gain an authoritative edge over interlaced system nodes, enabling them to maneuver through the electronic pathways of Level 3 terminals with ease.",
                    "Those users who hone their aptitude with the MHD-995 Hacking Device discover a near-instinctive speed and responsiveness when navigating electronic matrices and overcoming Level 4 software barriers.",
                    "Mastering the MHD-995 Hacking Device gifts users with a mastery over all foreign electronic systems, thus enabling them to navigate and control pathways and nodes with the ease of a network administrator."
                ],
                type: UpgradeType.CAPTURE,
                maxLevel: 5,
                currentLevel: 1
            },
            {
                title: "Fortify",
                description: "The software defenses provided by the Costikyan NeuralOptics Node Fortifier instantly turn any captured node into an intruder asset against the host system, rendering it both a barrier against detection, and a solid beach-head from which to launch further intrusion. The power of these defenses are variable, determined by the user's skill and preference.",
                levelDescriptions: [
                    "Neophyte users of the Costikyan NeuralOptics Node Fortifier will immediately discover a difference in the strength of the software barriers established for their captured nodes.",
                    "A bit of practice affords the Costikyan NeuralOptics Node Fortifier user the ability to significantly enhance the defenses on co-opted systems.",
                    "Solid protection against intrusion countermeasures is available to anyone with the Costikyan NeuralOptics Node Fortifier, once they've developed a reasonable aptitude with the device."
                ],
                type: UpgradeType.FORTIFY,
                maxLevel: 3,
                currentLevel: 1
            },
            {
                title: "Stealth",
                description: "Given enough time, even the most advanced electronic system can be penetrated. The MHD-995SH Informational Warfare Obfuscation Augmentation provides that mission-critical time with software as sophisticated as that found within any defense grid.\n" +
                    "A natural companion to the MHD-995 Tactical Informational Warfare Augmentation, the MHD-995SH Informational Warfare Obfuscation Augmentation slots neatly beside that device within the cranium. During an intrusion scenario, the Obfuscation Augmentation actively transmits misdirection and noise packets throughout the target system, alternately confusing and confounding active software defenses, decreasing the likelihood of detection by intrusion countermeasures.",
                levelDescriptions: [
                    "Even from first use, the MHD-995SH Informational Warfare Obfuscation Augmentation provides a 15% decrease in the detection probability of any intrusive action, down to a minimum of 15%.",
                    "Familiarity with the MHD-995SH Informational Warfare Obfuscation Augmentation will decrease the likelihood of detection for any intrusive action by 30%, down to a minimum of 15%.",
                    "A skilled user of the MHD-995SH Informational Warfare Obfuscation Augmentation will experience a 45% decrease across the board in terms of detection likelihoods for intrusive actions, down to a minimum of 15%."
                ],
                type: UpgradeType.STEALTH,
                maxLevel: 3,
                currentLevel: 0
            },
            {
                title: "Analyze",
                description: "Use of the Network Scout Electronic Systems Analysis Augmentation in conjunction with a hacking augmentation device provides the user with important information during a hacking scenario, including the percentage likelihood of detection, content of APIs, and/or content of datastores.\n" +
                    "Compatible with all top-line hacking augmentations, the Network Scout is a cranial implantation that provides instantaneous feedback on every aspect of an electronic intrusion. Upon access, highly specialized scripts issue forth to relay data back to the parent hacking augmentation, efficiently employing its inherent functionality to present crucial real-time status.",
                levelDescriptions: [
                    "With a little bit of practice, the Network Scout user can evaluate the likelihood of detection for an attack on any node not currently in range.",
                    "The very advanced Network Scout user can determine the content of any datastore within the targeted system, regardless of the linking or degree of control."
                ],
                type: UpgradeType.ANALYZE,
                maxLevel: 2,
                currentLevel: 0
            }
        ];
    }
}