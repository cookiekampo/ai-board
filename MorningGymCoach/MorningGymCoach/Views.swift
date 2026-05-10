import SwiftUI

struct TodayMenuView: View {
    @EnvironmentObject var store: SessionStore

    var body: some View {
        let planned = store.plannedSession
        List {
            Section("今日のメニュー") {
                Text("\(planned.name) / \(planned.durationMinutes)分")
                ForEach(Array(planned.plannedExercises.enumerated()), id: \.offset) { idx, item in
                    Text("\(idx+1). \(exerciseName(item.exerciseId)) \(Int(item.plannedWeightKg))kg x \(item.sets)")
                }
            }
            Section {
                NavigationLink("セット入力を開始") { SetInputView() }
                    .font(.title3.bold())
            }
        }
    }

    func exerciseName(_ id: String) -> String { store.exercises.first { $0.id == id }?.name ?? id }
}

struct SetInputView: View {
    @EnvironmentObject var store: SessionStore
    @State private var weight: Double = 0
    @State private var reps: Int = 10
    @State private var rir: RIRLevel = .two
    @State private var nextHint = ""
    @State private var rest = 120
    @State private var goTimer = false

    var currentPlan: PlannedExercise { store.plannedSession.plannedExercises[store.currentExerciseIndex] }
    var setNo: Int { store.performedSets.filter { $0.exerciseId == currentPlan.exerciseId }.count + 1 }
    var isLastSafeSet: Bool { store.currentExerciseIndex == store.plannedSession.plannedExercises.count - 1 && currentPlan.allOutAllowed }

    var body: some View {
        VStack(spacing: 12) {
            Text(store.exercises.first { $0.id == currentPlan.exerciseId }?.name ?? "")
                .font(.title2.bold())
            Text("セット \(setNo)/\(currentPlan.sets)")
            Stepper("重量: \(Int(weight))kg", value: $weight, in: 0...300, step: 2.5)
            Stepper("回数: \(reps)", value: $reps, in: 1...30)

            Picker("RIR", selection: $rir) {
                ForEach(RIRLevel.allCases) { Text($0.rawValue).tag($0) }
            }.pickerStyle(.segmented)

            Button("セット記録") {
                let checkedRIR = sanitizeRIR(rir)
                let isAllOut = checkedRIR == .zero
                rest = restRule(checkedRIR)
                nextHint = guidance(for: checkedRIR)
                store.addSet(PerformedSet(id: UUID(), sessionId: store.plannedSession.id, exerciseId: currentPlan.exerciseId, setNumber: setNo, plannedWeightKg: currentPlan.plannedWeightKg, actualWeightKg: weight, reps: reps, rir: checkedRIR, rpe: checkedRIR.rpe, restSeconds: rest, painFlag: false, isAllOut: isAllOut, note: ""))
                advanceIfNeeded(checkedRIR)
                goTimer = true
            }
            .buttonStyle(.borderedProminent)

            HStack {
                Button("痛み") { store.markPainAndFinishExercise(exerciseId: currentPlan.exerciseId) }
                    .buttonStyle(.bordered)
                Button("直前修正") { store.updateLastSet(weight: weight, reps: reps, rir: rir) }
                Button("直前削除") { store.deleteLastSet() }
            }

            NavigationLink("", isActive: $goTimer) {
                RestTimerView(restSeconds: rest, nextWeight: weight, targetRep: targetRepText(), hint: nextHint)
            }.hidden()
        }
        .padding()
        .onAppear { weight = currentPlan.plannedWeightKg }
    }

    func sanitizeRIR(_ input: RIRLevel) -> RIRLevel {
        let exType = store.exercises.first { $0.id == currentPlan.exerciseId }?.type
        if exType == .heavyCompound && input == .zero { return .one }
        if input == .zero && (!isLastSafeSet || store.painMode || !currentPlan.allOutAllowed) { return .one }
        return input
    }

    func restRule(_ rir: RIRLevel) -> Int { switch rir { case .fourPlus, .three: return 90; case .two: return 120; case .one: return 150; case .zero: return currentPlan.restSeconds } }
    func guidance(for rir: RIRLevel) -> String {
        switch rir {
        case .fourPlus: return "同重量。次回アップ候補。"
        case .three: return "同重量。良い入り。"
        case .two: return "同重量で継続。"
        case .one: return "同重量。目標回数を少し下げる。"
        case .zero: return "この種目は終了。"
        }
    }
    func targetRepText() -> String { currentPlan.repRange }

    func advanceIfNeeded(_ rir: RIRLevel) {
        let done = setNo >= currentPlan.sets || rir == .zero
        if done { store.currentExerciseIndex += 1 }
    }
}

struct RestTimerView: View {
    @State var restSeconds: Int
    let nextWeight: Double
    let targetRep: String
    let hint: String
    @State private var timer: Timer?

    var body: some View {
        VStack(spacing: 20) {
            Text("残り \(restSeconds) 秒").font(.largeTitle.bold())
            Text("次重量: \(Int(nextWeight))kg")
            Text("目標回数: \(targetRep)")
            Text(hint).lineLimit(3)
            NavigationLink("次セットへ") { SetInputView() }
                .buttonStyle(.borderedProminent)
        }.onAppear { start() }.onDisappear { timer?.invalidate() }
    }

    func start() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { t in
            if restSeconds > 0 { restSeconds -= 1 } else { t.invalidate() }
        }
    }
}

struct SummaryView: View {
    @EnvironmentObject var store: SessionStore

    var body: some View {
        List {
            Section("トレ後まとめ") {
                ForEach(store.performedSets) { s in
                    VStack(alignment: .leading) {
                        Text("\(name(s.exerciseId)) Set\(s.setNumber): \(Int(s.actualWeightKg))kg x \(s.reps), RIR \(s.rir.rawValue)")
                        Text("予定 \(Int(s.plannedWeightKg))kg / 差分 \(Int(s.actualWeightKg - s.plannedWeightKg))kg")
                            .font(.caption)
                    }
                }
            }
        }
    }

    func name(_ id: String) -> String { store.exercises.first { $0.id == id }?.name ?? id }
}
