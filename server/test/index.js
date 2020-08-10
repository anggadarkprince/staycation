const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const {app} = require('../app');
const fs = require('fs');

chai.use(chaiHttp);

describe('API ENDPOINT TESTING', () => {
    it('GET Landing Page', (done) => {
        chai.request(app).get('/api/landing').end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('hero')
            expect(res.body.hero).to.have.all.keys('travelers', 'treasures', 'cities')
            expect(res.body).to.have.property('mostPicked')
            expect(res.body.mostPicked).to.have.an('array')
            expect(res.body).to.have.property('category')
            expect(res.body.category).to.have.an('array')
            expect(res.body).to.have.property('testimonial')
            expect(res.body.testimonial).to.have.an('object')
            done();
        })
    })

    it('GET Detail Page', (done) => {
        chai.request(app).get('/api/detail/5f092da776061f7a389b6f74').end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('country')
            expect(res.body).to.have.property('isPopular')
            expect(res.body).to.have.property('imageId')
            expect(res.body.imageId).to.have.an('array')
            expect(res.body).to.have.property('facilities')
            expect(res.body.facilities).to.have.an('array')
            expect(res.body).to.have.property('activities')
            expect(res.body.activities).to.have.an('array')
            expect(res.body).to.have.property('_id')
            expect(res.body).to.have.property('title')
            expect(res.body).to.have.property('price')
            expect(res.body).to.have.property('city')
            expect(res.body).to.have.property('description')
            expect(res.body).to.have.property('__v')
            expect(res.body).to.have.property('bank')
            expect(res.body.bank).to.have.an('array')
            expect(res.body.testimonial).to.have.an('object')
            done();
        })
    })

    it('POST Booking Page', (done) => {
        const image = __dirname + '/../public/dist/img/favicon.png';
        const dataSample = {
            image,
            idItem: '5f092da776061f7a389b6f74',
            duration: 2,
            bookingStartDate: '9-4-2020',
            bookingEndDate: '11-4-2020',
            firstName: 'itce',
            lastName: 'diasari',
            email: 'itce@gmail.com',
            phoneNumber: '08150008989',
            accountHolder: 'itce',
            accountNumber: '24234-234234',
            bankFrom: 'BNI',
        }
        chai.request(app).post('/api/booking')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .field('item', dataSample.idItem)
            .field('from_date', dataSample.bookingStartDate)
            .field('until_date', dataSample.bookingEndDate)
            .field('user', '5f07d8ac1e01fd83f8bb63e0')
            .field('accountHolder', dataSample.accountHolder)
            .field('accountNumber', dataSample.accountNumber)
            .field('bankFrom', dataSample.bankFrom)
            .attach('image', fs.readFileSync(dataSample.image), 'buktibayar.jpeg')
            .end((err, res) => {
                expect(err).to.be.null
                expect(res).to.have.status(201)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message')
                expect(res.body.message).to.equal('Success Booking')
                expect(res.body).to.have.property('booking')
                expect(res.body.booking).to.have.all.keys('transactionNumber', 'status', 'createdAt', 'updatedAt', 'payment', '_id', 'bookingStartDate', 'bookingEndDate', 'itemId', 'userId', '__v')
                expect(res.body.booking.payment).to.have.all.keys('paymentMethod', 'proofPayment', 'bank', 'accountHolder', 'accountNumber', 'paidAt')
                expect(res.body.booking.itemId).to.have.all.keys('_id', 'price', 'duration')
                done();
            })
    })
})
