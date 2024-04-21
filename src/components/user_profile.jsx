import React, { useState, useEffect, useRef } from "react";
import { motion } from 'framer-motion';
import './styles/user_profile.scss';
import logoDesktop from "../components/assets/cyberseculearn.png";
import { useNavigate } from "react-router-dom";
import { gsap, TextPlugin } from 'gsap/all';
import image1 from '../components/assets/userprofile/image1.png';
import image2 from '../components/assets/userprofile/image2.png';
import image3 from '../components/assets/userprofile/image3.png';
import image4 from '../components/assets/userprofile/image4.png';

gsap.registerPlugin(TextPlugin);

export default function UserProfile() {
    const [playing, setPlaying] = useState(false)
    const [user, setUser] = useState();
    const [showQuiz, setShowQuiz] = useState(false);

    const handleQuizStart = () => {
        setShowQuiz(true);
    };

    const handleQuizComplete = () => {
        setShowQuiz(false);
    };
    const navigate = useNavigate();
    const [scrolling, setScrolling] = useState(false);
    const [openIndex, setOpenIndex] = useState(null);
    const [courses, setCourses] = useState();
    const fetchCourses = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND;
            const response = await fetch(backendUrl + "/courses");
            if (response.ok) {
                const data = await response.json()
                setCourses(data)
            } else {
                console.log("Incorrect fetch");
            }
        } catch (error) {
            console.error('Error logging in:', error);
        }
    }
    async function fetchUserData(username) {
        const backendUrl = import.meta.env.VITE_BACKEND;
        const userDataRes = await fetch(backendUrl + "/users/" + username);
        const userData = await userDataRes.json()
        localStorage.setItem('userdata', JSON.stringify(userData));
        fetchCourses();
        setUser(userData)
    }
    useEffect(() => {
        if (localStorage.getItem('userdata')) {
            const name = JSON.parse(localStorage.getItem('userdata')).username;
            fetchUserData(name)
        }
        else {
            navigate("/")
        }
    }, [playing])
    useEffect(() => {
        function handleScroll() {
            if (window.scrollY > 0) {
                setScrolling(true);
            } else {
                setScrolling(false);
            }
        }
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    useEffect(() => {
        window.addEventListener('message', handleMessageFromIframe);
        return () => {
            window.removeEventListener('message', handleMessageFromIframe);
        };
    }, [user, playing]);

    const handleMessageFromIframe = async (event) => {
        if (event.data === "win") {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND;
                const current = user.course_detail.find(course => course.coursename === playing.coursename);
                if (playing.levels > current.level) {
                    alert("You have unlocked new course material! WOHOOO!");
                    const leveledUpCourse = {
                        ...current,
                        level: current.level + 1,
                    };
                    await fetch(`${backendUrl}/users/${user.username}/course_detail`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            course_detail: [leveledUpCourse]
                        })
                    });
                    setUser(prevUser => ({
                        ...prevUser,
                        course_detail: prevUser.course_detail.map(course =>
                            course.coursename === leveledUpCourse.coursename ? leveledUpCourse : course
                        )
                    }));
                    localStorage.setItem('userdata', JSON.stringify(user));
                }
                else {
                    alert("You have already unlocked all content! Take the quiz to obtain certificate.")
                }
            } catch (error) {
                console.error('Failed to update user course details:', error);
            }
        }
    };

    const animatedTextRef = useRef(null);
    const japaneseTexts = [
        "ゲーマー",
        "学生",
        "イノベーター",
        "物珍しい",
    ];
    const englishTexts = [
        "Gamers.",
        "Learners.",
        "Innovators.",
        "Keepers.",
    ];
    const [profileImage, setProfileImage] = useState(image1);

    useEffect(() => {
        if (playing === false) {
            const tl = gsap.timeline({ repeat: -1 });
            for (let i = 0; i < japaneseTexts.length; i++) {
                tl.to(animatedTextRef.current, {
                    onStart: () => setProfileImage(getProfileImage(i + 1)),
                    duration: 0.5,
                    text: {
                        value: japaneseTexts[i],
                        padSpace: false
                    },
                    ease: 'fade',
                    delay: 0
                })
                    .to(animatedTextRef.current, {
                        duration: 1,
                        text: {
                            value: englishTexts[i],
                            padSpace: false
                        },
                        ease: 'none',
                        delay: 2
                    })
                    .to(animatedTextRef.current, {
                        duration: 0.5,
                        text: {
                            value: "",
                            padSpace: false
                        },
                        ease: 'none',
                        delay: 3
                    });
            }
        }
    }, [playing]);

    const getProfileImage = (index) => {
        switch (index) {
            case 1:
                return image1;
            case 2:
                return image2;
            case 3:
                return image3;
            case 4:
                return image4;
            default:
                return image1;
        }
    };
    const getStatus = (course) => {
        const enrolledCourse = user.course_detail.find(element => element.coursename === course.coursename);
        if (enrolledCourse) {
            if (enrolledCourse.status == "incomplete")
                return "Enrolled";
            return "Completed"
        } else if (course.status === "Coming Soon") {
            return "Coming Soon";
        }
        return "New";
    };

    const getLevel = (course) => {
        const enrolledCourse = user.course_detail.find(element => element.coursename === course.coursename);
        if (enrolledCourse) {
            return `${enrolledCourse.level}/${course.levels}`;
        }
        return `0/${course.levels}`;
    };

    const getButton = (course) => {
        const enrolledCourse = user.course_detail.find(element => element.coursename === course.coursename);
        if (enrolledCourse && enrolledCourse.level === course.levels) {
            if (enrolledCourse.status != "complete")
                return "QUIZ"
            return "VIEW";
        }
        return "PLAY";
    };
    const startGame = async (coursename) => {
        const existingCourse = user.course_detail.find(course => course.coursename === coursename);
        if (!existingCourse) {
            const newCourse = {
                coursename,
                level: 0,
                status: "incomplete",
                start_date: new Date().toLocaleDateString()
            };
            try {
                const backendUrl = import.meta.env.VITE_BACKEND;
                await fetch(`${backendUrl}/users/${user.username}/course_detail`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        course_detail: [newCourse]
                    })
                });
                setUser(prevUser => ({
                    ...prevUser,
                    course_detail: [...prevUser.course_detail, newCourse]
                }));
                localStorage.setItem('userdata', JSON.stringify(user))
            } catch (error) {
                console.error('Failed to update user course details:', error);
            }
        }
        try {
            const backendUrl = import.meta.env.VITE_BACKEND;
            const course = await (await fetch(`${backendUrl}/courses/${coursename}`)).json();
            setPlaying(course);
            window.scrollTo(100, 100)
        } catch (error) {
            console.error('Failed to fetch course details:', error);
        }
    };

    const GameCard = ({ image, name, level, status, button }) => {
        return (
            <>
                <div className="gamecard">
                    <div className="thumbnail">
                        <img src={image} alt="" />
                    </div>
                    <div className="details">
                        <h1 style={{ color: "#3586ff" }}>{name}</h1>
                        <p>You : {level}</p>
                        <p>Status : {status}</p>
                        {status == "Coming Soon" ? <button className="locked">{button}</button> : <button onClick={() => { startGame(name) }}>{button}</button>}
                    </div>
                </div>
            </>
        )
    }
    const [score, setScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const makeCertificate = async () => {
        const backendUrl = import.meta.env.VITE_BACKEND;
        console.log(user);
        const current=user.course_detail.find(obj=>obj.coursename===playing.coursename);
        const response = await fetch(`${backendUrl}/certificate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: user.name,
                courseName: playing.coursename,
                grade: current.grade,
                start_date: current.start_date,
                end_date: current.end_date
            }),
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'certificate.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const QuizOverlay = ({ quiz, onQuizComplete }) => {
        const handleAnswer = async (answerIndex) => {
            var localScore;
            if (quiz.Answers[currentQuestion] === answerIndex) {
                setScore(score + 1);
                localScore=score+1;
            }
            else{
                localScore=score;
            }
            const nextQuestion = currentQuestion + 1;
            if (nextQuestion < Object.keys(quiz).length - 1) {
                setCurrentQuestion(nextQuestion);
            } else {
                if (localScore >= 6) {
                    try {
                        const backendUrl = import.meta.env.VITE_BACKEND;
                        const grade=""+(localScore/(Object.keys(quiz).length - 1)*100)+"%";
                        const current = user.course_detail.find(course => course.coursename === playing.coursename);
                        const finishedCourse = {
                            ...current,
                            status: "complete",
                            end_date: new Date().toLocaleDateString(),
                            grade: grade
                        };
                        await fetch(`${backendUrl}/users/${user.username}/course_detail`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                course_detail: [finishedCourse]
                            })
                        });
                        setUser(prevUser => ({
                            ...prevUser,
                            course_detail: prevUser.course_detail.map(course =>
                                course.coursename === finishedCourse.coursename ? finishedCourse : course
                            )
                        }));
                        localStorage.setItem('userdata', JSON.stringify(user));
                        alert('You needed at least 75% to pass. You have recieved : ' + localScore + "/" + (Object.keys(quiz).length - 1) + "\nYou can now VIEW your course certificate.");
                    } catch (error) {
                        console.error('Failed to update user course details:', error);
                    }
                } else {
                    alert('You need at least 75% to pass. You have recieved : ' + localScore + "/" + (Object.keys(quiz).length - 1));
                }
                onQuizComplete();
            }
        };

        return (
            <div className="quiz-overlay">
                <div className="quiz-box">
                    <h2>Question: {currentQuestion + 1}</h2>
                    <p>{Object.keys(quiz)[currentQuestion]}</p>
                    {quiz[Object.keys(quiz)[currentQuestion]].map((answer, index) => (
                        <button key={index} onClick={() => handleAnswer(index + 1)}>{answer}</button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className={`${playing===false ? 'bgpage2' : 'bgpage3'}`}></div>
            <header>
                <motion.div
                    className={`navbar-container ${scrolling ? 'navbar-container-bg' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <img src={logoDesktop} alt="Logo" />
                    <div className="navlinks">
                        <p className="hello">Hello, <span className="username">{user ? user.username : "Player"}</span></p>
                        <button className="menu-button" onClick={() => { localStorage.removeItem("userdata"); navigate("/login") }}>
                            <img src="https://cdn1.iconfinder.com/data/icons/heroicons-ui/24/logout-1024.png" alt="" />
                        </button>
                    </div>
                </motion.div>
            </header>
            <main>
                <hr className="glowing-hr" />
                {
                    playing == false ?
                        (
                            <>
                                <section className='personal-container'>
                                    <div className='image-container'>
                                        <img src={profileImage} alt="Profile" />
                                    </div>
                                    <div className='text-container'>
                                        <p className={window.innerWidth < 800 ? "animated-text-mobile" : "animated-text"}>
                                            We are {window.innerWidth < 800 ? <br /> : null}
                                            <span ref={animatedTextRef}></span>
                                        </p>
                                        <h1><strong>CyberSecuLearn</strong></h1>
                                        <p>
                                            A gamified education platform that's aimed to take learning Next Gen
                                            <br />1. Education is a critical take that needs to keep evolving with time.
                                            <br />2. Effective learning needs to be engaging and fun, paired with our traditional methods; as a supplement.
                                            <br />We are excited to introduce you to our platform.
                                        </p>
                                        <hr />
                                        <p>Engage. Educate. Evolve.</p>
                                    </div>
                                </section>
                                <hr className="glowing-hr" />
                                <section className="courses">
                                    {courses ? courses.map((course) => {
                                        return (<GameCard key={course.coursename} image={course.thumbnail} name={course.coursename} level={getLevel(course)} status={getStatus(course)} button={getButton(course)} username={user.username} />)
                                    }) : <GameCard key={"LOADING"} image={"https://th.bing.com/th/id/R.c72b405bab42ca81a90328e071886340?rik=yEIQitJj9od1%2bA&pid=ImgRaw&r=0"} name={"LOADING..."} level={"0/3"} status={"Coming Soon"} button={"WAIT"} username={"PLAYER"} />}
                                </section>
                            </>

                        ) : (
                            <section className="game">
                                <div className="gameframe">
                                    <div className="backspace">
                                        <h1 className="wintext">{playing.coursename} - {playing.levels != user.course_detail.find(obj => obj.coursename === playing.coursename).level ? "Play to Win" : "Take the QUIZ"}</h1>
                                        <button className="quiz" onClick={() => setPlaying(false)}>BACK</button>
                                    </div>
                                    <iframe
                                        src={playing.gamelink}
                                        style={{ width: "1024px", height: "576px", border: "none" }}
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        sandbox="allow-scripts"
                                    ></iframe>
                                </div>
                                <div className="gamecontent">
                                    <h1 className="wintext">Win to Unlock</h1>
                                    <div className="top">
                                        <div className="videos">
                                            {playing.levels > 0 &&
                                                playing.lessons.video_content.slice(0, user.course_detail.find(course => course.coursename === playing.coursename).level).map((video, index) => (
                                                    <iframe
                                                        key={index}
                                                        src={video}
                                                        style={{ height: "800px", border: "none", margin: "10px", borderRadius: "10px" }}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
                                                    ></iframe>
                                                ))}
                                        </div>
                                        <div className="notes">
                                            {playing.levels > 0 &&
                                                playing.lessons.document_content.slice(0, user.course_detail.find(course => course.coursename === playing.coursename).level).map((document, index) => (
                                                    <div className="doclink" key={index}>
                                                        <img src="https://1000logos.net/wp-content/uploads/2023/01/Google-Docs-logo-2048x1152.png" alt="" width={300} />
                                                        <div className="textindoc">
                                                            <h1>Level {index + 1}</h1>
                                                            <a key={index} href={document} target="_blank" rel="noreferrer">
                                                                Open
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                    {user.course_detail.find(course => course.coursename === playing.coursename).level === playing.levels ? (
                                        user.course_detail.find(course => course.coursename === playing.coursename).status === "incomplete" ?
                                            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                                                {showQuiz && <QuizOverlay quiz={playing.quiz} onQuizComplete={handleQuizComplete} />}
                                                <button onClick={() => { setScore(0); setCurrentQuestion(0); handleQuizStart() }} className="quiz">QUIZ</button>
                                            </div>
                                            :
                                            <button onClick={makeCertificate} className="quiz">VIEW</button>
                                    ) : null}
                                </div>
                                <h3 className="wintext">FAQs</h3>
                                <div className="FAQ">
                                    <div key={-1} className="faq-item" onClick={() => setOpenIndex(openIndex === -1 ? null : -1)}>
                                        <h4>How to play this game? How does this course work?</h4>
                                        {openIndex === -1 && <p>Control the character using WASD keys, move around the map to find and fight wild knowledgebees. For every knowledgebee (Draggle) defeated you will unlock new course content. Once you have viewed all content and maxed out your level; you can take up the QUIZ and pass to become the master of this domain.</p>}
                                    </div>
                                    {Object.entries(playing.qna).map(([question, answer], index) => (
                                        <div key={question} className="faq-item" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                                            <h4>{question}</h4>
                                            {openIndex === index && <p>{answer}</p>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )
                }
                <hr className="glowing-hr" />
            </main>
            <>
                <footer className="footer">
                    <div className="waves">
                        <div className="wave" id="wave1"></div>
                        <div className="wave" id="wave2"></div>
                        <div className="wave" id="wave3"></div>
                        <div className="wave" id="wave4"></div>
                    </div>
                    <ul className="menu">
                        <motion.li className="menu__item" whileHover={{ scale: (1.3) }}><a className="menu__link" href="/Verify" target='_blank'>Youtube</a></motion.li>
                        <motion.li className="menu__item" whileHover={{ scale: (1.3) }}><a className="menu__link" href="/Verify" target='_blank'>Instagram</a></motion.li>
                        <motion.li className="menu__item" whileHover={{ scale: (1.3) }}><a className="menu__link" href="/Verify" target='_blank'>LinkedIn</a></motion.li>
                        <motion.li className="menu__item" whileHover={{ scale: (1.3) }}><a className="menu__link" href="/Verify" target='_blank'>Contact</a></motion.li>
                    </ul>
                    <p>&copy;2024 CyberSecuLearn | All Rights Reserved</p>
                </footer>
            </>
        </div>
    )
}

