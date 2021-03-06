import pool from '../lib/utils/pool.js';
import setup from '../data/setup.js';
import request from 'supertest';
import app from '../lib/app.js';
import UserService from '../lib/services/UserService.js';
import Post from '../lib/models/Post.js';
import Comment from '../lib/models/Comment.js';


describe('demo routes', () => {

  let user = {};
  let agent;

  beforeEach(async() => {
    await setup(pool);
    agent = await request.agent(app);
    user = await UserService.create({
      username: 'Azlynn',
      password: 'password',
      profilePhotoUrl: 'a'
    });
    await agent.post('/api/v1/auth/login')
      .send({
        username: 'Azlynn',
        password: 'password'
      });
  });

  it('creates a post via POST', async() => {

    const res = await agent
      .post('/api/v1/posts')
      .send({
        userId: user.id,
        photoUrl: 'picture',
        caption: 'Lookie Lookie',
        tags: ['winter', 'wonderland']
      });

    expect(res.body).toEqual({
      id: '1',
      userId: user.id,
      photoUrl: 'picture',
      caption: 'Lookie Lookie',
      tags: ['winter', 'wonderland']
    });
  });

  it('gets all posts', async() => {
    const post1 = await Post.insert({
      userId: user.id,
      photoUrl: 'picture',
      caption: 'Lookie Lookie',
      tags: ['winter', 'wonderland']
    });

    const post2 = await Post.insert({
      userId: user.id,
      photoUrl: 'picture2',
      caption: 'first let me take a selfie',
      tags: ['funny', 'pic']
    });

    const res = await request(app)
      .get('/api/v1/posts');

    expect(res.body).toEqual([post1, post2]);
  });

  it('gets a posts by id', async() => {

    const post = await Post.insert({
      userId: user.id,
      photoUrl: 'picture',
      caption: 'Lookie Lookie',
      tags: ['winter', 'wonderland']
    });

    await Comment.insert({
      id: '1',
      commentBy: user.id,
      post: post.id,
      comment: 'Beautiful!',
    });

    const res = await request(app)
      .get(`/api/v1/posts/${post.id}`);
    expect(res.body).toEqual(post);
  });

  it('updates a post', async() => {
    const post = await Post.insert({
      userId: user.id,
      photoUrl: 'picture',
      caption: 'placeholder',
      tags: ['haha', 'sorry not sorry']
    });

    post.caption = 'new doggie shot';

    const res = await agent
      .patch(`/api/v1/posts/${post.id}`)
      .send({ caption: 'new doggie shot' });

    expect(res.body).toEqual(post);
  });

  it('deletes a post', async() => {
    const post = await Post.insert({
      userId: user.id,
      photoUrl: 'z',
      caption: 'Party!',
      tags: ['party hard', 'party forever']
    });

    const res = await agent
      .delete(`/api/v1/posts/${post.id}`)
      .send(post);

    expect(res.body).toEqual(post);
  });

  it('gets top 10 posts', async() => {
    const post1 = await Post.insert({
      userId: user.id,
      photoUrl: 'x',
      caption: 'ugh',
      tags: ['mistake', 'never again']
    });
    
    await Comment.insert({
      id: '1',
      commentBy: user.id,
      post: post1.id,
      comment: 'Wow!',
    });

    await Comment.insert({
      id: '1',
      commentBy: user.id,
      post: post1.id,
      comment: 'Wow!',
    });

    await Comment.insert({
      id: '1',
      commentBy: user.id,
      post: post1.id,
      comment: 'Wow!',
    });

    const res = await request(app)
      .get('/api/v1/posts/popular');

    expect(res.body[0]).toEqual(post1);

  });
});


