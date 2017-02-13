# Nomie Cloud App for Public Sharing
Share data from any Nomie tracker at an anonymous public URL

To setup add
[https://nomie.noahcodes.com/join](https://nomie.noahcodes.com/join) to Nomie as
a 3rd party Cloud App. Every time you run the cloud app it will display your
public link which you can click, and then share with whomeever you want. Keep in
mind the URL, although unique to you is not fully private, so be considerate of
what you add as the tracker name.

## Local Setup:
* `git clone https://github.com/huberf/nomie-public`
* `cd nomie-public`
* `npm install`
* `npm start`

## Heroku Setup:
* `git clone https://github.com/huberf/nomie-public`
* `cd nomie-public`
* `heroku create`
* `git push heroku master`
* `heroku open`

If you want to have a fully private instance of this, please follow the above
steps. Nomie is centered around privacy, so creating your own personal instance
will give you the ability to easily selectively share your data without the
middle man of my personal instance.

If you have ideas or want to contribute please open an issue or a PR.
