import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { MatchProvider } from './context/MatchContext'; // Assuming you have a MatchContext
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import MatchPage from './components/MatchPage';
import TournamentList from './components/Tournaments';
import TournamentPage from './components/TournamentPage';
import BalanceManagement from './components/BalanceManagement';
import Notifications from './components/Notifications';
import Leaderboard from './components/Leaderboard';
import BettingHistory from './components/BettingHistory';
import UserStats from './components/UserStats';
import Referral from './components/Referral';
import MatchPrediction from './components/MatchPrediction';
import AdminDashboard from './components/AdminDashboard';
import Store from './components/Store';
import ActivityFeed from './components/ActivityFeed';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import BettingPage from './components/BettingPage';
import ForumList from './components/ForumList';
import ThreadView from './components/ThreadView';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';

const ProtectedRoute = ({ component: Component, adminOnly = false, ...rest }) => {
    const { isAuthenticated, isAdmin } = useUser();
    return (
        <Route
            {...rest}
            render={(props) => 
                (isAuthenticated && (!adminOnly || (adminOnly && isAdmin))) ? (
                    <Component {...props} />
                ) : (
                    isAuthenticated ? 
                        <Redirect to="/" /> :
                        <Redirect to="/login" />
                )
            }
        />
    );
};

function App() {
    return (
        <Router>
            <UserProvider>
                <MatchProvider>
                    <div className="App">
                        <Header />
                        <main>
                            <Switch>
                                <Route exact path="/" component={Home} />
                                <Route path="/login" component={Login} />
                                <Route path="/signup" component={Signup} />
                                <ProtectedRoute path="/profile" component={UserProfile} />
                                <ProtectedRoute path="/match/:matchId" component={MatchPage} />
                                <ProtectedRoute path="/tournaments" exact component={TournamentList} />
                                <ProtectedRoute path="/tournament/:id" component={TournamentPage} />
                                <ProtectedRoute path="/balance" component={BalanceManagement} />
                                <ProtectedRoute path="/notifications" component={Notifications} />
                                <ProtectedRoute path="/leaderboard" component={Leaderboard} />
                                <ProtectedRoute path="/betting-history" component={BettingHistory} />
                                <ProtectedRoute path="/stats" component={UserStats} />
                                <ProtectedRoute path="/referral" component={Referral} />
                                <ProtectedRoute path="/predict-match" component={MatchPrediction} />
                                <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly={true} />
                                <ProtectedRoute path="/store" component={Store} />
                                <ProtectedRoute path="/chat" exact component={ChatList} />
                                <ProtectedRoute path="/chat/:roomId" component={ChatRoom} />
                                <ProtectedRoute path="/bet" component={BettingPage} />
                                <Route path="/forum" exact component={ForumList} />
                                <Route path="/forum/thread/:threadId" component={ThreadView} />
                                <Route path="/blog" exact component={BlogList} />
                                <Route path="/blog/:postId" component={BlogPost} />
                                {/* Add more routes as needed */}
                            </Switch>
                        </main>
                        <Footer />
                    </div>
                </MatchProvider>
            </UserProvider>
        </Router>
    );
}

export default App;