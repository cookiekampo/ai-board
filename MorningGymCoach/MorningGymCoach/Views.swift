import SwiftUI

struct TodayMenuView: View {
    @EnvironmentObject var store: SessionStore
    var body: some View {
        let planned = store.plannedSession
        List {
            Section("今日のメニュー") {
                Text("\(planned.name) / \(planned.durationMinutes)分")
                ForEach(Array(planned.plannedExercises.enumerated()), id: \.offset) { idx, item in
                    let ex = store.exercise(for: item.exerciseId)
                    Text("\(idx+1). \(ex?.name ?? item.exerciseId) \(weightLabel(item.plannedWeightKg, ex)) x \(item.sets)")
                }
            }
            Section { NavigationLink("セット入力を開始") { SetInputView() }.font(.title3.bold()) }
        }
    }

    func weightLabel(_ kg: Double, _ ex: Exercise?) -> String {
        if ex?.loadType == .dumbbellEachHand { return "片手\(Int(kg))kg" }
        return "\(Int(kg))kg"
    }
}

struct SetInputView: View {
    @EnvironmentObject var store: SessionStore
    @State private var weight: Double = 0
    @State private var reps: Int = 10
    @State private var rir: RIRLevel = .two
    @State private var goTimer = false
    @State private var nextHint = ""
    @State private var rest = 60

    var currentPlan: PlannedExercise { store.plannedSession.plannedExercises[store.currentExerciseIndex] }
    var currentExercise: Exercise? { store.exercise(for: currentPlan.exerciseId) }
    var setNo: Int { store.performedSets.filter { $0.exerciseId == currentPlan.exerciseId }.count + 1 }
    var isLastExercise: Bool { store.currentExerciseIndex == store.plannedSession.plannedExercises.count - 1 }
    var isLastSetOfExercise: Bool { setNo >= currentPlan.sets }

    var body: some View {
        VStack(spacing: 12) {
            Text(currentExercise?.name ?? "").font(.title2.bold())
            Text("セット \(setNo)/\(currentPlan.sets)")
            Text("予定: \(plannedWeightText()) / \(repLabel()) / 目標RIR\(targetRirText())")
                .font(.footnote)
            Stepper("重量: \(displayWeight(weight))", value: $weight, in: 0...300, step: currentExercise?.weightStepKg ?? 2.5)
            Stepper("回数: \(reps)", value: $reps, in: 1...30)
            Picker("RIR", selection: $rir) { ForEach(RIRLevel.allCases) { Text($0.rawValue).tag($0) } }.pickerStyle(.segmented)

            Button("記録して休憩") {
                let safeRIR = sanitizeRIR(rir)
                rest = correctedRestSeconds(for: safeRIR)
                nextHint = guidance(for: safeRIR)
                store.addSet(PerformedSet(id: UUID(), sessionId: store.plannedSession.id, exerciseId: currentPlan.exerciseId, setNumber: setNo, plannedWeightKg: currentPlan.plannedWeightKg, actualWeightKg: weight, reps: reps, rir: safeRIR, rpe: safeRIR.rpe, restSeconds: rest, painFlag: false, isAllOut: safeRIR == .zero, note: ""))
                if isLastSetOfExercise || safeRIR == .zero { store.currentExerciseIndex += 1 }
                goTimer = true
            }.buttonStyle(.borderedProminent)

            HStack {
                Button("痛み") { store.markPainAndFinishExercise(exerciseId: currentPlan.exerciseId) }.buttonStyle(.bordered)
                Button("直前修正") { store.updateLastSet(weight: weight, reps: reps, rir: sanitizeRIR(rir)) }
                Button("直前削除") { store.deleteLastSet() }
            }

            NavigationLink("", isActive: $goTimer) {
                RestTimerView(restSeconds: rest, nextWeight: weight, targetRep: repLabel(), hint: nextHint)
            }.hidden()
        }.padding().onAppear { weight = currentPlan.plannedWeightKg }
    }

    func sanitizeRIR(_ input: RIRLevel) -> RIRLevel {
        if currentExercise?.type == .heavyCompound && input == .zero { return .one }
        if input == .zero && (store.painMode || !isLastExercise || !isLastSetOfExercise || !currentPlan.allOutAllowed) { return .one }
        return input
    }
    func correctedRestSeconds(for rir: RIRLevel) -> Int {
        let base = currentPlan.restSeconds
        let rule = (rir == .fourPlus || rir == .three) ? 90 : (rir == .two ? 120 : (rir == .one ? 150 : base))
        return max(base, rule)
    }
    func guidance(for rir: RIRLevel) -> String {
        if currentExercise?.type == .heavyCompound { return "RIR0禁止。フォーム優先。" }
        return rir == .zero ? "最終種目終了。" : "同重量で継続。"
    func plannedWeightText() -> String { displayWeight(currentPlan.plannedWeightKg) }
    func displayWeight(_ kg: Double) -> String { currentExercise?.loadType == .dumbbellEachHand ? "片手\(Int(kg))kg" : "\(Int(kg))kg" }
    func repLabel() -> String { currentExercise?.id == "bulgarian_split_squat" ? "片脚\(currentPlan.repRange)回" : currentPlan.repRange }
    func targetRirText() -> String { currentPlan.targetRir.indices.contains(setNo - 1) ? currentPlan.targetRir[setNo - 1].rawValue : currentPlan.targetRir.last?.rawValue ?? "-" }
}

struct RestTimerView: View {
    @State var restSeconds: Int
    let nextWeight: Double
    let targetRep: String
    let hint: String
    @State private var timer: Timer?
    @State private var goNext = false

    var body: some View {
        VStack(spacing: 20) {
            Text("あと \(restSeconds)秒").font(.largeTitle.bold())
            Text("次重量: \(Int(nextWeight))kg")
            Text("目標: \(targetRep)")
            Text(hint).lineLimit(3)
            NavigationLink("", isActive: $goNext) { NextSetGuideView(hint: hint) }.hidden()
        }.onAppear { start() }.onDisappear { timer?.invalidate() }
    }
    func start() { timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { t in if restSeconds > 0 { restSeconds -= 1 } else { t.invalidate(); goNext = true } } }
}

struct NextSetGuideView: View {
    let hint: String
    var body: some View {
        VStack(spacing: 16) {
            Text("次セット指示").font(.title2.bold())
            Text(hint).lineLimit(3)
            NavigationLink("次セットへ") { SetInputView() }.buttonStyle(.borderedProminent)
        }.padding()
    }
}

struct SummaryView: View {
    @EnvironmentObject var store: SessionStore
    var body: some View {
        List {
            Section("トレ後まとめ") {
                ForEach(store.plannedSession.plannedExercises, id: \.exerciseId) { plan in
                    let exSets = store.performedSets.filter { $0.exerciseId == plan.exerciseId }
                    VStack(alignment: .leading, spacing: 4) {
                        Text(store.exercise(for: plan.exerciseId)?.name ?? plan.exerciseId)
                        Text("予定: \(Int(plan.plannedWeightKg))kg / \(plan.sets)セット / \(plan.repRange)").font(.caption)
                        ForEach(exSets) { s in
                            Text("実績: \(Int(s.actualWeightKg))kg x \(s.reps) RIR\(s.rir.rawValue) (差分\(Int(s.actualWeightKg - s.plannedWeightKg))kg)").font(.caption2)
                        }
                    }
                }
            }
        }
    }
}
