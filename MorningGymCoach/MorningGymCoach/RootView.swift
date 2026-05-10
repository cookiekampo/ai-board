import SwiftUI

struct RootView: View {
    @EnvironmentObject var store: SessionStore

    var body: some View {
        NavigationStack {
            if store.isFinished {
                SummaryView()
            } else {
                TodayMenuView()
            }
        }
    }
}
