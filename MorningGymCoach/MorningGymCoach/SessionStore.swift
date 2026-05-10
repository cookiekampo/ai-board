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
            Exercise(id: "chest_press", name: "チェストプレス", type: .machine, weightStepKg: 2.5, defaultRepRange: "8-10", allOutAllowed: false, restPauseAllowed: false),
            Exercise(id: "lat_pulldown", name: "ラットプル", type: .machine, weightStepKg: 2.5, defaultRepRange: "8-12", allOutAllowed: false, restPauseAllowed: false),
            Exercise(id: "cable_fly", name: "ケーブルフライ", type: .cable, weightStepKg: 2.5, defaultRepRange: "12-15", allOutAllowed: true, restPauseAllowed: true)
        ]
        plannedSession = PlannedSession(id: UUID(), date: Date(), name: "胸・背中", durationMinutes: 45, plannedExercises: [
            PlannedExercise(exerciseId: "chest_press", plannedWeightKg: 50, sets: 3, repRange: "8-10", targetRir: [.two, .one, .one], restSeconds: 120, allOutAllowed: false, restPauseAllowed: false),
            PlannedExercise(exerciseId: "lat_pulldown", plannedWeightKg: 45, sets: 3, repRange: "8-12", targetRir: [.two, .one, .one], restSeconds: 120, allOutAllowed: false, restPauseAllowed: false),
            PlannedExercise(exerciseId: "cable_fly", plannedWeightKg: 15, sets: 2, repRange: "12-15", targetRir: [.one, .zero], restSeconds: 60, allOutAllowed: true, restPauseAllowed: true)
        ])
        load()
    }

    var isFinished: Bool {
        currentExerciseIndex >= plannedSession.plannedExercises.count
    }

    func addSet(_ set: PerformedSet) {
        performedSets.append(set)
        save()
    }

    func updateLastSet(weight: Double, reps: Int, rir: RIRLevel) {
        guard var last = performedSets.popLast() else { return }
        last.actualWeightKg = weight
        last.reps = reps
        last.rir = rir
        last.rpe = rir.rpe
        performedSets.append(last)
        save()
    }

    func deleteLastSet() {
        _ = performedSets.popLast()
        save()
    }

    func markPainAndFinishExercise(exerciseId: String) {
        painMode = true
        let next = plannedSession.plannedExercises.firstIndex { $0.exerciseId == exerciseId }.map { $0 + 1 } ?? currentExerciseIndex
        currentExerciseIndex = next
    }

    func save() {
        if let data = try? JSONEncoder().encode(performedSets) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }

    func load() {
        guard let data = UserDefaults.standard.data(forKey: key), let sets = try? JSONDecoder().decode([PerformedSet].self, from: data) else { return }
        performedSets = sets
    }
}
