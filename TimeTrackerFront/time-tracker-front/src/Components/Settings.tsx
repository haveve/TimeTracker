import { Button, ButtonGroup, Card, Col, Row } from "react-bootstrap";
import '../Custom.css';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { getCookie, setCookie, setCookieParamas } from "../Login/Api/login-logout";
import { lngs } from "../i18n";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { changeLocation } from "../Redux/Slices/LocationSlice";

function Settings() {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const listOfTimeZones = useSelector((state: RootState) => {
        return state.location.listOfTimeZones
    })
    const geoOffset = useSelector((state: RootState) => {
        return state.location.userOffset
    })
    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
        const cookie: setCookieParamas = {
            name: "lang",
            value: language,
            expires_second: 365 * 24 * 60 * 60,
            path: "/"
        };
        setCookie(cookie);
    }

    return (
        <div className='Settings d-flex align-items-center flex-column  mt-5'>
            <h3>{t("Settings.header")}</h3>
            <Card style={{ width: '18rem' }} className='w-50'>
                <Card.Body>
                    <Row className="w-100 mb-4">
                        <Col>
                            <h4>{t("Settings.chooseLang")}:</h4>
                        </Col>
                        <Col className="d-flex p-0">
                                <ButtonGroup className="w-50 ms-auto">
                                    {Object.keys(lngs).map((lng) => {
                                        return (
                                            <Button type="submit"
                                                variant="outline-secondary text-white"
                                                key={lng}
                                                onClick={() => changeLanguage(lng)}
                                                disabled={i18n.resolvedLanguage === lng}
                                                className="w-50"
                                            >
                                                {lng}
                                            </Button>)
                                    })}
                                </ButtonGroup>
                        </Col>
                    </Row>
                    <Row className="w-100">
                        <Col>
                            <h4>{t("Settings.location")}:</h4>
                        </Col>
                        <Col className="d-flex p-0">
                            <Button variant='outline-secondary text-white ms-auto' onClick={() => {
                                const list = listOfTimeZones.filter(l => l.value === geoOffset)
                                const name = list[1] ? list[1].name : list[0].name
                                const obj = listOfTimeZones.filter(l => l.name !== name)[0]
                                if (obj)
                                    dispatch(changeLocation({ oldOffSet: geoOffset, newOffSet: obj.value }))
                            }}>
                                {(function () {
                                    const list = listOfTimeZones.filter(l => l.value === geoOffset)
                                    return list[1] ? list[1].name : list[0].name
                                })()}
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div >
    );
}

export default Settings;
