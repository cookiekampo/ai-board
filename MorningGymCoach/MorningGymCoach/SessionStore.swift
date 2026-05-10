import Foundation

final class SessionStore: ObservableObject {
    @Published var plannedSession: PlannedSession
    @Published var exercises: [Exercise]
    @Published var performedSets: [PerformedSet] = []
    @Published var currentExerciseIndex = 0
    @Published var painMode = false

    private let key = "morning_gym_v01_sets"

    init() {
        exercises = [
            Exercise(id: "squat", name: "スクワット", type: .heavyCompound, loadType: .barbellTotal, weightStepKg: 2.5, defaultRepRange: "6-8", allOutAllowed: false, restPauseAllowed: false),
            Exercise(id: "bulgarian_split_squat", name: "ブルガリアンスクワット", type: .heavyCompound, loadType: .dumbbellEachHand, weightStepKg: 2.5, defaultRepRange: "8-10", allOutAllowed: false, restPauseAllowed: false),
            Exercise(id: "leg_extension", name: "レッグエクステンション", type: .isolation, loadType: .machineStack, weightStepKg: 2.5, defaultRepRange: "12-15", allOutAllowed: true, restPauseAllowed: true)
        ]
            PlannedExercise(exerciseId: "squat", plannedWeightKg: 40, sets: 3, repRange: "6-8", targetRir: [.three, .two, .one], restSeconds: 180, allOutAllowed: false, restPauseAllowed: false),
            PlannedExercise(exerciseId: "bulgarian_split_squat", plannedWeightKg: 10, sets: 2, repRange: "8-10", targetRir: [.two, .one], restSeconds: 120, allOutAllowed: false, restPauseAllowed: false),
    var isFinished: Bool { currentExerciseIndex >= plannedSession.plannedExercises.count }
    func exercise(for id: String) -> Exercise? { exercises.first { $0.id == id } }
    func addSet(_ set: PerformedSet) { performedSets.append(set); save() }
    func updateLastSet(weight: Double, reps: Int, rir: RIRLevel) { guard var last = performedSets.popLast() else { return }; last.actualWeightKg = weight; last.reps = reps; last.rir = rir; last.rpe = rir.rpe; performedSets.append(last); save() }
    func deleteLastSet() { _ = performedSets.popLast(); save() }
    func markPainAndFinishExercise(exerciseId: String) { painMode = true; let next = plannedSession.plannedExercises.firstIndex { $0.exerciseId == exerciseId }.map { $0 + 1 } ?? currentExerciseIndex; currentExerciseIndex = next }
    func save() { if let data = try? JSONEncoder().encode(performedSets) { UserDefaults.standard.set(data, forKey: key) } }
    func load() { guard let data = UserDefaults.standard.data(forKey: key), let sets = try? JSONDecoder().decode([PerformedSet].self, from: data) else { return }; performedSets = sets }
    }

    func load() {
        guard let data = UserDefaults.standard.data(forKey: key), let sets = try? JSONDecoder().decode([PerformedSet].self, from: data) else { return }
        performedSets = sets
    }
}
