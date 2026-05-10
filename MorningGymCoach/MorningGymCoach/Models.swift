import Foundation

enum ExerciseType: String, Codable, CaseIterable {
    case heavyCompound = "heavy_compound"
    case machine
    case cable
    case isolation
    case bodyweight
}

enum LoadType: String, Codable, CaseIterable {
    case barbellTotal = "barbell_total"
    case dumbbellEachHand = "dumbbell_each_hand"
    case machineStack = "machine_stack"
}

enum RIRLevel: String, Codable, CaseIterable, Identifiable {
    case fourPlus = "4+"
    case three = "3"
    case two = "2"
    case one = "1"
    case zero = "0"

    var id: String { rawValue }
    var rpe: Int { switch self { case .fourPlus: return 6; case .three: return 7; case .two: return 8; case .one: return 9; case .zero: return 10 } }
}

struct Exercise: Identifiable, Codable {
    let id: String
    let name: String
    let type: ExerciseType
    let loadType: LoadType
    let weightStepKg: Double
    let defaultRepRange: String
    let allOutAllowed: Bool
    let restPauseAllowed: Bool
}

struct PlannedExercise: Codable {
    let exerciseId: String
    let plannedWeightKg: Double
    let sets: Int
    let repRange: String
    let targetRir: [RIRLevel]
    let restSeconds: Int
    let allOutAllowed: Bool
    let restPauseAllowed: Bool
}

struct PlannedSession: Identifiable, Codable {
    let id: UUID
    let date: Date
    let name: String
    let durationMinutes: Int
    let plannedExercises: [PlannedExercise]
}

struct PerformedSet: Identifiable, Codable {
    let id: UUID
    let sessionId: UUID
    let exerciseId: String
    let setNumber: Int
    let plannedWeightKg: Double
    var actualWeightKg: Double
    var reps: Int
    var rir: RIRLevel
    var rpe: Int
    var restSeconds: Int
    var painFlag: Bool
    var isAllOut: Bool
    var note: String
}
