import {EventApi} from '@fullcalendar/core';
import {Dependencies} from './../src/app/types';
import anyTest, {TestInterface} from 'ava';
import {WcjEvent} from '~app/event/types';
import dayjs from 'dayjs';
import {fixture} from 'ava-browser-fixture'
import jqueryProxy from 'jquery'
import {makeWcjEventListCreator} from '~app/event-group-list';

type TestData = {events: {[key: string]: (WcjEvent & Partial<EventApi>)}}
type TestContext = {
    // All mock data
    data: TestData,
    // I set the time the test begins so that the same time is used everywhere throughout the test
    testTime: Date,
    document: Document,
    deps: Dependencies
};
const test = anyTest as TestInterface<TestContext>;

function generateUniqueData(currentTime: Date): TestData {
    const now = dayjs(currentTime);
    const start = now.subtract(1, 'hour').toDate();
    const end = now.add(1, 'hour').toDate();

    const events = {
        event_1: {
            title: "Event 1",
            id: "event_1",
            occasions: [{
                start: start,
                end: end
            }],
            bgColor: "black",
            textColor: "white",
            showInCalendar: true
        }
    }

    return {events}
}


test.before.cb(t => {
    const currentTime = new Date();
    t.context.testTime = currentTime;
    t.context.data = generateUniqueData(currentTime);

    fixture("src/index.html")(t).then(() => {
        jqueryProxy(function ($: JQueryStatic) {
            let calendarEvents: EventApi[] = []
            t.context.deps = <Dependencies>{
                initFullerCalendar: (el => ({
                    //TODO: Add more
                    timeFrame: () => 'Month',
                    viewType: () => 'Grid',
                    getEvents: () => calendarEvents
                })),
                $: $
            };
            t.end();
        }.bind(t.context.document));
    })
});


test('courses gets added to course list on init', t => {
    // init page handler
    makeWcjEventListCreator(t.context.deps)(t.context.data.events);
    const courseListEl = t.context.deps.$('#courseList', t.context.document);
    const noOfChildren = courseListEl.get(0).children.length;
    t.is(noOfChildren, Object.keys(t.context.data.events).length);
})


test('clicking `selectAllCourses` button selects all courses', t => {
    // init page handler
    makeWcjEventListCreator(t.context.deps)(t.context.data.events);
    t.context.deps.$('#selectAllCourses', t.context.document).trigger('click');

});